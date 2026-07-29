import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroceryOrderStatus, OrderType, PaymentProvider, PaymentStatus, VehicleType } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { DispatchService } from '../dispatch/dispatch.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

type CashfreeOrderResponse = {
  order_id: string;
  cf_order_id: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
};

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

    if (!this.isCashfreeEnabled()) {
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

    const cashfreeOrder = await this.createCashfreeOrder(payment.id, amount, currency, dto, userId);
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayOrderId: cashfreeOrder.order_id,
        externalRef: cashfreeOrder.cf_order_id,
        metadata: { ...(dto.metadata || {}), cashfreePaymentSessionId: cashfreeOrder.payment_session_id },
      },
    });
    return this.paymentOrderResponse(updated, {
      gateway: 'cashfree',
      requiresGateway: true,
      paymentSessionId: cashfreeOrder.payment_session_id,
      environment: this.config.get<string>('CASHFREE_ENVIRONMENT', 'SANDBOX'),
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
    const gatewayOrder = await this.fetchCashfreeOrder(payment.gatewayOrderId);
    if (gatewayOrder.order_amount !== Number(payment.amount)) throw new BadRequestException('Gateway amount mismatch');
    if (gatewayOrder.order_status === 'PAID') {
      return this.finalizePaidPayment(payment.id, dto.gatewayPaymentId || payment.gatewayOrderId);
    }
    if (gatewayOrder.order_status === 'ACTIVE') {
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.AUTHORIZED, gatewayPaymentId: dto.gatewayPaymentId, verifiedAt: new Date() },
      });
    }
    await this.markFailed(payment.id, `Cashfree order status: ${gatewayOrder.order_status}`);
    throw new BadRequestException('Payment was not completed');
  }

  async getStatus(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (
      (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.AUTHORIZED)
      && payment.gatewayOrderId
      && !payment.gatewayOrderId.startsWith('mock_')
      && this.isCashfreeEnabled()
    ) {
      const gatewayOrder = await this.fetchCashfreeOrder(payment.gatewayOrderId);
      if (gatewayOrder.order_status === 'PAID') {
        return this.finalizePaidPayment(payment.id, payment.gatewayPaymentId || payment.gatewayOrderId);
      }
    }
    return payment;
  }

  async handleCashfreeWebhook(rawBody: Buffer | undefined, signature: string, timestamp: string, eventId: string, payload: any) {
    const secret = this.config.get<string>('CASHFREE_CLIENT_SECRET');
    if (!secret || !rawBody || !signature || !timestamp || !eventId) throw new BadRequestException('Invalid webhook request');
    const expected = createHmac('sha256', secret).update(`${timestamp}${rawBody.toString('utf8')}`).digest('base64');
    if (!this.safeCompare(expected, signature)) throw new BadRequestException('Invalid webhook signature');
    const existing = await this.prisma.paymentWebhookEvent.findUnique({ where: { eventId } });
    if (existing) return { received: true, duplicate: true };

    const eventType = String(payload?.type || payload?.event || 'unknown');
    const data = payload?.data || {};
    const entity = data?.payment || data?.order || {};
    const gatewayOrderId = entity?.order?.order_id || entity?.order_id || data?.order?.order_id;
    const gatewayPaymentId = entity?.cf_payment_id || entity?.payment_id;
    if (!gatewayOrderId) {
      await this.recordWebhookEvent(eventId, eventType);
      return { received: true };
    }
    const payment = await this.prisma.payment.findUnique({ where: { gatewayOrderId } });
    if (!payment) {
      await this.recordWebhookEvent(eventId, eventType);
      return { received: true };
    }

    const event = String(payload?.type || payload?.event || '');
    if (event.includes('SUCCESS') || event.includes('success') || event === 'PAYMENT_SUCCESS_WEBHOOK') {
      await this.finalizePaidPayment(payment.id, gatewayPaymentId || payment.gatewayPaymentId || undefined);
    } else if (event.includes('FAILED') || event.includes('failed') || event.includes('USER_DROPPED')) {
      await this.markFailed(payment.id, entity?.payment_message || 'Payment failed');
    } else if (event.includes('AUTHORIZED') && payment.status === PaymentStatus.PENDING) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.AUTHORIZED, gatewayPaymentId, verifiedAt: new Date() } });
    }
    await this.recordWebhookEvent(eventId, eventType);
    return { received: true };
  }

  private async recordWebhookEvent(eventId: string, eventType: string) {
    await this.prisma.paymentWebhookEvent.upsert({
      where: { eventId },
      update: {},
      create: { provider: 'cashfree', eventId, eventType },
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
    await this.prisma.payment.updateMany({
      where: { id: paymentId, status: { in: [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED] } },
      data: { status: PaymentStatus.FAILED, failureReason, verifiedAt: new Date() },
    });
    return this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  }

  private paymentOrderResponse(payment: any, overrides: Record<string, unknown> = {}) {
    const gateway = payment.gatewayOrderId?.startsWith('mock_') ? 'mock' : payment.gatewayOrderId ? 'cashfree' : 'internal';
    const metadata = payment.metadata && typeof payment.metadata === 'object' ? payment.metadata : {};
    return {
      paymentId: payment.id,
      gateway,
      requiresGateway: gateway === 'cashfree',
      orderId: payment.gatewayOrderId || `internal_${payment.id}`,
      amount: Number(payment.amount),
      amountPaise: this.toMinorUnits(Number(payment.amount)),
      currency: payment.currency,
      status: payment.status,
      paymentSessionId: gateway === 'cashfree' ? metadata.cashfreePaymentSessionId : undefined,
      environment: gateway === 'cashfree' ? this.config.get<string>('CASHFREE_ENVIRONMENT', 'SANDBOX') : undefined,
      ...overrides,
    };
  }

  private async createCashfreeOrder(paymentId: string, amount: number, currency: string, dto: CreatePaymentOrderDto, userId: string): Promise<CashfreeOrderResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { phone: true, email: true, fullName: true } });
    const customerPhone = String(user?.phone || dto.metadata?.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (customerPhone.length !== 10) throw new BadRequestException('A valid customer phone number is required for Cashfree');
    const response = await fetch(`${this.cashfreeBaseUrl()}/pg/orders`, {
      method: 'POST',
      headers: this.cashfreeHeaders(paymentId),
      body: JSON.stringify({
        order_amount: Number(amount.toFixed(2)), order_currency: currency, order_id: paymentId,
        customer_details: {
          customer_id: userId,
          customer_phone: customerPhone,
          ...(user?.email || dto.metadata?.customerEmail ? { customer_email: user?.email || dto.metadata?.customerEmail } : {}),
          ...(user?.fullName ? { customer_name: user.fullName } : {}),
        },
        order_note: dto.description || 'Rydex booking',
        order_tags: { sourceApp: dto.sourceApp, orderType: dto.orderType, orderId: dto.orderId || '', provider: dto.provider, ...(dto.metadata || {}) },
      }),
    });
    const data = (await response.json().catch(() => ({}))) as CashfreeOrderResponse & { message?: string };
    if (!response.ok) throw new BadRequestException(data.message || 'Unable to create Cashfree order');
    return data;
  }

  private async fetchCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
    const response = await fetch(`${this.cashfreeBaseUrl()}/pg/orders/${encodeURIComponent(orderId)}`, { headers: this.cashfreeHeaders() });
    const data = (await response.json().catch(() => ({}))) as CashfreeOrderResponse & { message?: string };
    if (!response.ok) throw new BadRequestException(data.message || 'Unable to verify Cashfree order');
    return data;
  }

  private getOrderRelation(orderType: OrderType, orderId?: string) {
    if (!orderId) return {};
    if (orderType === OrderType.RIDE) return { rideOrderId: orderId };
    if (orderType === OrderType.PARCEL) return { parcelOrderId: orderId };
    return { groceryOrderId: orderId };
  }

  private isCashfreeEnabled() {
    return this.config.get<string>('PAYMENT_GATEWAY', 'mock') === 'cashfree'
      && Boolean(this.config.get<string>('CASHFREE_CLIENT_ID'))
      && Boolean(this.config.get<string>('CASHFREE_CLIENT_SECRET'));
  }

  private cashfreeBaseUrl() {
    return this.config.get<string>('CASHFREE_ENVIRONMENT', 'SANDBOX') === 'PRODUCTION'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';
  }

  private cashfreeHeaders(requestId?: string) {
    return {
      'Content-Type': 'application/json',
      'x-api-version': this.config.get<string>('CASHFREE_API_VERSION', '2025-01-01'),
      'x-client-id': this.config.getOrThrow<string>('CASHFREE_CLIENT_ID'),
      'x-client-secret': this.config.getOrThrow<string>('CASHFREE_CLIENT_SECRET'),
      ...(requestId ? { 'x-request-id': requestId, 'x-idempotency-key': requestId } : {}),
    };
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
