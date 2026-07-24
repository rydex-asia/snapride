import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroceryOrderStatus, OrderType, PaymentProvider, PaymentStatus, VehicleType } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { DispatchService } from '../dispatch/dispatch.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

type RazorpayOrderResponse = { id: string; amount: number; currency: string; status: string };
type RazorpayPaymentResponse = { id: string; order_id: string; amount: number; currency: string; status: string; error_description?: string };

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly dispatch: DispatchService,
    private readonly notifications: NotificationsService,
  ) {}

  async createOrder(userId: string, dto: CreatePaymentOrderDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey: dto.idempotencyKey } });
      if (existing) {
        if (existing.userId !== userId) throw new BadRequestException('Invalid payment request');
        return this.paymentOrderResponse(existing);
      }
    }

    const currency = (dto.currency || 'INR').toUpperCase();
    const amount = await this.resolveTrustedAmount(userId, dto);
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        provider: dto.provider,
        amount,
        currency,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
        ...this.getOrderRelation(dto.orderType, dto.orderId),
      },
    });

    if (dto.provider === PaymentProvider.WALLET) {
      await this.prisma.$transaction(async (transaction) => {
        const debited = await transaction.wallet.updateMany({
          where: { userId, balance: { gte: amount } },
          data: { balance: { decrement: amount } },
        });
        if (debited.count !== 1) throw new BadRequestException('Insufficient wallet balance');
      });
      const paid = await this.finalizePaidPayment(payment.id, `wallet_${payment.id}`);
      return this.paymentOrderResponse(paid, { gateway: 'wallet', requiresGateway: false });
    }

    if (dto.provider === PaymentProvider.CASH) {
      return this.paymentOrderResponse(payment, { gateway: 'cash', requiresGateway: false });
    }

    if (!this.isRazorpayEnabled()) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new InternalServerErrorException('Payment gateway is not configured');
      }
      const gatewayOrderId = `mock_order_${payment.id}`;
      const updated = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayOrderId, externalRef: gatewayOrderId, status: PaymentStatus.AUTHORIZED },
      });
      return this.paymentOrderResponse(updated, { gateway: 'mock', requiresGateway: false });
    }

    const razorpayOrder = await this.createRazorpayOrder(payment.id, amount, currency, dto);
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: razorpayOrder.id, externalRef: razorpayOrder.id },
    });
    return this.paymentOrderResponse(updated, {
      gateway: 'razorpay',
      requiresGateway: true,
      keyId: this.config.getOrThrow<string>('RAZORPAY_KEY_ID'),
      amountPaise: razorpayOrder.amount,
      name: 'Frezo',
      description: dto.description || 'Frezo grocery order',
    });
  }

  async verify(userId: string, dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findFirst({ where: { id: dto.paymentId, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.PAID) return payment;
    if (!payment.gatewayOrderId || dto.gatewayOrderId !== payment.gatewayOrderId) {
      throw new BadRequestException('Payment order does not match');
    }

    if (payment.gatewayOrderId.startsWith('mock_order_')) {
      if (this.config.get<string>('NODE_ENV') === 'production') throw new BadRequestException('Mock payments are disabled');
      return this.finalizePaidPayment(payment.id, `mock_payment_${payment.id}`);
    }
    if (!dto.gatewayPaymentId || !dto.gatewaySignature) {
      throw new BadRequestException('Missing gateway payment verification data');
    }

    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) throw new InternalServerErrorException('Razorpay secret is not configured');
    const expected = createHmac('sha256', secret)
      .update(`${payment.gatewayOrderId}|${dto.gatewayPaymentId}`)
      .digest('hex');
    if (!this.safeCompare(expected, dto.gatewaySignature)) {
      await this.markFailed(payment.id, 'Invalid payment signature');
      throw new BadRequestException('Invalid payment signature');
    }

    const gatewayPayment = await this.fetchRazorpayPayment(dto.gatewayPaymentId);
    if (gatewayPayment.order_id !== payment.gatewayOrderId) throw new BadRequestException('Gateway order mismatch');
    if (gatewayPayment.amount !== this.toMinorUnits(Number(payment.amount))) throw new BadRequestException('Gateway amount mismatch');
    if (gatewayPayment.status === 'captured') {
      return this.finalizePaidPayment(payment.id, gatewayPayment.id);
    }
    if (gatewayPayment.status === 'authorized') {
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.AUTHORIZED, gatewayPaymentId: gatewayPayment.id, verifiedAt: new Date() },
      });
    }
    await this.markFailed(payment.id, gatewayPayment.error_description || `Gateway status: ${gatewayPayment.status}`);
    throw new BadRequestException('Payment was not captured');
  }

  async getStatus(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async handleRazorpayWebhook(rawBody: Buffer | undefined, signature: string, eventId: string, payload: any) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret || !rawBody || !signature || !eventId) throw new BadRequestException('Invalid webhook request');
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!this.safeCompare(expected, signature)) throw new BadRequestException('Invalid webhook signature');
    const existing = await this.prisma.paymentWebhookEvent.findUnique({ where: { eventId } });
    if (existing) return { received: true, duplicate: true };

    const eventType = String(payload?.event || 'unknown');
    const entity = payload?.payload?.payment?.entity;
    const gatewayOrderId = entity?.order_id || payload?.payload?.order?.entity?.id;
    const gatewayPaymentId = entity?.id;
    if (!gatewayOrderId) {
      await this.recordWebhookEvent(eventId, eventType);
      return { received: true };
    }
    const payment = await this.prisma.payment.findUnique({ where: { gatewayOrderId } });
    if (!payment) {
      await this.recordWebhookEvent(eventId, eventType);
      return { received: true };
    }

    const event = String(payload?.event || '');
    if (event === 'payment.captured' || event === 'order.paid') {
      await this.finalizePaidPayment(payment.id, gatewayPaymentId || payment.gatewayPaymentId || undefined);
    } else if (event === 'payment.failed') {
      await this.markFailed(payment.id, entity?.error_description || 'Payment failed');
    } else if (event === 'payment.authorized' && payment.status === PaymentStatus.PENDING) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.AUTHORIZED, gatewayPaymentId, verifiedAt: new Date() },
      });
    }
    await this.recordWebhookEvent(eventId, eventType);
    return { received: true };
  }

  private async recordWebhookEvent(eventId: string, eventType: string) {
    await this.prisma.paymentWebhookEvent.upsert({
      where: { eventId },
      update: {},
      create: { provider: 'razorpay', eventId, eventType },
    });
  }

  private async resolveTrustedAmount(userId: string, dto: CreatePaymentOrderDto) {
    if (dto.orderType !== OrderType.GROCERY || !dto.orderId) return Number(dto.amount);
    const order = await this.prisma.groceryOrder.findFirst({ where: { id: dto.orderId, customerId: userId } });
    if (!order) throw new NotFoundException('Grocery order not found');
    if (order.status !== GroceryOrderStatus.CREATED) throw new BadRequestException('Order is not awaiting payment');
    return Number(order.total);
  }

  private async finalizePaidPayment(paymentId: string, gatewayPaymentId?: string) {
    const current = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!current) throw new NotFoundException('Payment not found');
    if (current.status === PaymentStatus.PAID) return current;
    const claimed = await this.prisma.payment.updateMany({
      where: { id: paymentId, status: { not: PaymentStatus.PAID } },
      data: {
        status: PaymentStatus.PAID,
        gatewayPaymentId,
        externalRef: gatewayPaymentId || current.externalRef,
        verifiedAt: new Date(),
        failureReason: null,
      },
    });
    const paid = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (claimed.count === 1 && paid.groceryOrderId) await this.confirmAndDispatchGroceryOrder(paid.groceryOrderId);
    return paid;
  }

  private async confirmAndDispatchGroceryOrder(orderId: string) {
    const order = await this.prisma.groceryOrder.findUnique({ where: { id: orderId }, include: { store: true } });
    if (!order) return;
    const confirmed = await this.prisma.groceryOrder.updateMany({
      where: { id: orderId, status: GroceryOrderStatus.CREATED },
      data: { status: GroceryOrderStatus.SEARCHING_PARTNER },
    });
    if (confirmed.count === 1) {
      await this.prisma.groceryOrderStatusEvent.createMany({ data: [
        { orderId, status: GroceryOrderStatus.CONFIRMED, title: 'Order confirmed', detail: 'Payment received and the store has your order.' },
        { orderId, status: GroceryOrderStatus.PACKING, title: 'Packing your groceries', detail: 'Fresh items are being carefully packed.' },
      ] });
      await this.notifications.notify(order.customerId, 'Order confirmed', 'Payment received. We’re packing your groceries now.', { type: 'GROCERY_ORDER', orderId, status: GroceryOrderStatus.CONFIRMED });
    }
    const existingDispatch = await this.prisma.dispatchJob.findFirst({ where: { groceryOrderId: orderId } });
    if (!existingDispatch) {
      await this.dispatch.dispatch({
        sourceApp: order.sourceApp,
        orderType: OrderType.GROCERY,
        orderId,
        pickupLat: Number(order.store.latitude),
        pickupLng: Number(order.store.longitude),
        vehicleType: VehicleType.BIKE,
      });
    }
  }

  private async markFailed(paymentId: string, failureReason: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED, failureReason, verifiedAt: new Date() },
    });
  }

  private paymentOrderResponse(payment: any, overrides: Record<string, unknown> = {}) {
    const gateway = payment.gatewayOrderId?.startsWith('mock_') ? 'mock' : payment.gatewayOrderId ? 'razorpay' : 'internal';
    return {
      paymentId: payment.id,
      gateway,
      requiresGateway: gateway === 'razorpay',
      keyId: gateway === 'razorpay' ? this.config.get<string>('RAZORPAY_KEY_ID') : undefined,
      orderId: payment.gatewayOrderId || `internal_${payment.id}`,
      amount: Number(payment.amount),
      amountPaise: this.toMinorUnits(Number(payment.amount)),
      currency: payment.currency,
      status: payment.status,
      ...overrides,
    };
  }

  private async createRazorpayOrder(paymentId: string, amount: number, currency: string, dto: CreatePaymentOrderDto): Promise<RazorpayOrderResponse> {
    const keyId = this.config.getOrThrow<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: this.toMinorUnits(amount), currency, receipt: paymentId,
        notes: { sourceApp: dto.sourceApp, orderType: dto.orderType, orderId: dto.orderId || '', provider: dto.provider, ...(dto.metadata || {}) },
      }),
    });
    const data = (await response.json().catch(() => ({}))) as RazorpayOrderResponse & { error?: { description?: string } };
    if (!response.ok) throw new BadRequestException(data.error?.description || 'Unable to create Razorpay order');
    return data;
  }

  private async fetchRazorpayPayment(paymentId: string): Promise<RazorpayPaymentResponse> {
    const keyId = this.config.getOrThrow<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    });
    const data = (await response.json().catch(() => ({}))) as RazorpayPaymentResponse & { error?: { description?: string } };
    if (!response.ok) throw new BadRequestException(data.error?.description || 'Unable to verify gateway payment');
    return data;
  }

  private getOrderRelation(orderType: OrderType, orderId?: string) {
    if (!orderId) return {};
    if (orderType === OrderType.RIDE) return { rideOrderId: orderId };
    if (orderType === OrderType.PARCEL) return { parcelOrderId: orderId };
    return { groceryOrderId: orderId };
  }

  private isRazorpayEnabled() {
    return this.config.get<string>('PAYMENT_GATEWAY', 'mock') === 'razorpay'
      && Boolean(this.config.get<string>('RAZORPAY_KEY_ID'))
      && Boolean(this.config.get<string>('RAZORPAY_KEY_SECRET'));
  }

  private safeCompare(expected: string, actual: string) {
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  }

  private toMinorUnits(amount: number) {
    return Math.round(Number(amount) * 100);
  }
}
