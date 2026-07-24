import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DispatchStatus, GroceryOrderStatus, PartnerStatus, PaymentStatus, Role, SupportRequestStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateGroceryOrderDto } from './dto/create-grocery-order.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { DeliveryAddressDto } from './dto/delivery-address.dto';
import { RealtimeService } from '../../shared/socket/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../shared/types/auth-user.type';
import { UpdateGroceryStatusDto } from './dto/update-grocery-status.dto';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Injectable()
export class GroceryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async checkServiceability(latitude: number, longitude: number) {
    const stores = await this.prisma.store.findMany({ where: { isActive: true } });
    const ranked = stores
      .map((store) => ({
        store,
        distanceKm: this.distanceKm(latitude, longitude, Number(store.latitude), Number(store.longitude)),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
    const nearest = ranked[0];
    const eligible = ranked.find(({ store, distanceKm }) => distanceKm <= Number(store.serviceRadiusKm));

    if (!eligible) {
      return {
        serviceable: false,
        reason: stores.length ? 'OUTSIDE_DELIVERY_AREA' : 'NO_ACTIVE_STORE',
        nearestDistanceKm: nearest ? Number(nearest.distanceKm.toFixed(2)) : null,
        message: 'Frezo is not delivering to this location yet',
      };
    }

    const speed = Math.max(8, Number(eligible.store.averageDeliverySpeedKph));
    const travelMinutes = (eligible.distanceKm / speed) * 60;
    const etaMin = Math.max(8, Math.ceil(eligible.store.averagePickingMinutes + travelMinutes + 2));
    return {
      serviceable: true,
      store: { id: eligible.store.id, name: eligible.store.name, address: eligible.store.address },
      distanceKm: Number(eligible.distanceKm.toFixed(2)),
      etaMin,
      etaMax: etaMin + 5,
      etaLabel: `${etaMin}–${etaMin + 5} mins`,
    };
  }

  async listAddresses(userId: string) {
    const addresses = await this.prisma.deliveryAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
    return addresses.map((address) => ({
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    }));
  }

  async saveAddress(userId: string, dto: DeliveryAddressDto, addressId?: string) {
    if (addressId) {
      const existing = await this.prisma.deliveryAddress.findFirst({ where: { id: addressId, userId } });
      if (!existing) throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (transaction) => {
      if (dto.isDefault) {
        await transaction.deliveryAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const data = { ...dto, userId };
      if (addressId) {
        return transaction.deliveryAddress.update({ where: { id: addressId }, data: dto });
      }
      const hasAddress = await transaction.deliveryAddress.count({ where: { userId } });
      return transaction.deliveryAddress.create({ data: { ...data, isDefault: dto.isDefault || hasAddress === 0 } });
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.prisma.deliveryAddress.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new NotFoundException('Address not found');
    await this.prisma.deliveryAddress.delete({ where: { id: addressId } });
    if (existing.isDefault) {
      const next = await this.prisma.deliveryAddress.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });
      if (next) await this.prisma.deliveryAddress.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return { deleted: true };
  }

  private distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDelta = toRadians(lat2 - lat1);
    const lngDelta = toRadians(lng2 - lng1);
    const a = Math.sin(latDelta / 2) ** 2
      + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(lngDelta / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async listCatalog(query: CatalogQueryDto = {}) {
    const search = query.search?.trim();
    const category = query.category?.trim();
    const [stores, categories] = await Promise.all([this.prisma.store.findMany({
      where: { isActive: true, ...(query.storeId ? { id: query.storeId } : {}) },
      orderBy: { createdAt: 'asc' },
      include: {
        products: {
          where: {
            isActive: true,
            stock: { gt: 0 },
            ...(category
              ? { category: { is: { OR: [{ slug: category }, { name: { equals: category, mode: 'insensitive' } }] } } }
              : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          orderBy: { name: 'asc' },
          include: { category: true },
        },
      },
    }), this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, imageKey: true },
    })]);

    return {
      categories,
      stores: stores.map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
        products: store.products.map((product) => ({
          id: product.id,
          sku: product.sku,
          storeId: product.storeId,
          name: product.name,
          brand: product.brand,
          unit: product.unit,
          description: product.description,
          price: Number(product.price),
          mrp: Number(product.mrp || product.price),
          stock: product.stock,
          imageUrl: product.imageUrl,
          imageKey: product.imageKey,
          variantGroup: product.variantGroup,
          category: product.category
            ? { id: product.category.id, name: product.category.name }
            : null,
        })),
      })),
    };
  }

  async getCart(customerId: string) {
    const cart = await this.prisma.groceryCart.findUnique({
      where: { customerId },
      include: {
        store: true,
        items: {
          orderBy: { createdAt: 'asc' },
          include: { product: { include: { category: true } } },
        },
      },
    });
    return this.serializeCart(cart);
  }

  async setCartItem(customerId: string, productId: string, quantity: number) {
    const existingCart = await this.prisma.groceryCart.findUnique({
      where: { customerId },
      include: { items: true },
    });

    if (quantity === 0) {
      if (existingCart) {
        await this.prisma.groceryCartItem.deleteMany({ where: { cartId: existingCart.id, productId } });
        const remaining = await this.prisma.groceryCartItem.count({ where: { cartId: existingCart.id } });
        if (remaining === 0) {
          await this.prisma.groceryCart.update({ where: { id: existingCart.id }, data: { storeId: null } });
        }
      }
      return this.getCart(customerId);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true, store: { isActive: true } },
    });
    if (!product) throw new BadRequestException('Product is unavailable');
    if (quantity > product.stock) throw new BadRequestException(`Only ${product.stock} item(s) are available`);
    if (existingCart?.storeId && existingCart.storeId !== product.storeId && existingCart.items.length > 0) {
      throw new BadRequestException('Complete or clear the current store cart before adding this item');
    }

    const cart = await this.prisma.groceryCart.upsert({
      where: { customerId },
      update: { storeId: product.storeId },
      create: { customerId, storeId: product.storeId },
    });
    await this.prisma.groceryCartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity },
      create: { cartId: cart.id, productId, quantity, unitPrice: product.price },
    });
    return this.getCart(customerId);
  }

  async validateCart(customerId: string) {
    const cart = await this.prisma.groceryCart.findUnique({
      where: { customerId },
      include: { store: true, items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return { valid: false, subtotal: 0, issues: [{ code: 'EMPTY_CART', message: 'Your cart is empty' }], cart: this.serializeCart(cart) };
    }

    const issues = cart.items.flatMap((item) => {
      if (!item.product.isActive) {
        return [{ productId: item.productId, code: 'UNAVAILABLE', message: `${item.product.name} is unavailable` }];
      }
      if (item.product.stock < item.quantity) {
        return [{ productId: item.productId, code: 'INSUFFICIENT_STOCK', available: item.product.stock, message: `Only ${item.product.stock} ${item.product.name} available` }];
      }
      if (Number(item.unitPrice) !== Number(item.product.price)) {
        return [{ productId: item.productId, code: 'PRICE_CHANGED', previousPrice: Number(item.unitPrice), currentPrice: Number(item.product.price), message: `${item.product.name} price changed to ₹${Number(item.product.price)}` }];
      }
      return [];
    });
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    const priceChangedItems = cart.items.filter((item) => Number(item.unitPrice) !== Number(item.product.price));
    if (priceChangedItems.length) {
      await this.prisma.$transaction(priceChangedItems.map((item) => this.prisma.groceryCartItem.update({
        where: { id: item.id },
        data: { unitPrice: item.product.price },
      })));
    }

    return {
      valid: issues.length === 0 && Boolean(cart.store?.isActive),
      subtotal,
      deliveryFee: 30,
      total: subtotal + 30,
      issues: cart.store?.isActive ? issues : [{ code: 'STORE_UNAVAILABLE', message: 'The selected store is unavailable' }, ...issues],
      cart: this.serializeCart(cart),
    };
  }

  async clearCart(customerId: string) {
    await this.prisma.groceryCart.deleteMany({ where: { customerId } });
    return { id: null, storeId: null, itemCount: 0, subtotal: 0, items: [] };
  }

  private serializeCart(cart: any) {
    if (!cart) return { id: null, storeId: null, itemCount: 0, subtotal: 0, items: [] };
    const items = (cart.items || []).map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      product: {
        id: item.product.id,
        sku: item.product.sku,
        storeId: item.product.storeId,
        name: item.product.name,
        brand: item.product.brand,
        unit: item.product.unit,
        price: Number(item.product.price),
        mrp: Number(item.product.mrp || item.product.price),
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        imageKey: item.product.imageKey,
        isActive: item.product.isActive,
      },
    }));
    return {
      id: cart.id,
      storeId: cart.storeId,
      store: cart.store ? { id: cart.store.id, name: cart.store.name, isActive: cart.store.isActive } : null,
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal: items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0),
      items,
      updatedAt: cart.updatedAt,
    };
  }

  async listOrders(customerId: string) {
    return this.prisma.groceryOrder.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
        items: { include: { product: true } },
        statusEvents: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async getOrderTracking(user: AuthUser, orderId: string) {
    const order = await this.prisma.groceryOrder.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        partner: { include: { user: { select: { fullName: true, phone: true } }, vehicles: { where: { isActive: true }, take: 1 } } },
        items: { include: { product: true } },
        statusEvents: { orderBy: { createdAt: 'asc' } },
        supportRequests: { where: { customerId: user.sub }, orderBy: { createdAt: 'desc' } },
      },
    });
    const allowed = order && (user.role === Role.ADMIN || order.customerId === user.sub || order.partner?.userId === user.sub || order.store.ownerId === user.sub);
    if (!order || !allowed) throw new NotFoundException('Grocery order not found');

    const partnerLocation = order.partnerId
      ? await this.prisma.partnerLocation.findFirst({ where: { partnerId: order.partnerId }, orderBy: { createdAt: 'desc' } })
      : null;
    let etaMinutes: number | null = null;
    if (order.status === GroceryOrderStatus.DELIVERED) etaMinutes = 0;
    else if (partnerLocation) {
      const km = this.distanceKm(Number(partnerLocation.latitude), Number(partnerLocation.longitude), Number(order.deliveryLat), Number(order.deliveryLng));
      etaMinutes = Math.max(2, Math.ceil((km / 18) * 60 + 2));
    } else {
      const serviceability = await this.checkServiceability(Number(order.deliveryLat), Number(order.deliveryLng));
      etaMinutes = serviceability.serviceable && serviceability.etaMin != null ? Number(serviceability.etaMin) : null;
    }
    return {
      ...order,
      subtotal: Number(order.subtotal), deliveryFee: Number(order.deliveryFee), total: Number(order.total),
      deliveryLat: Number(order.deliveryLat), deliveryLng: Number(order.deliveryLng),
      etaMinutes,
      etaLabel: etaMinutes === null ? 'Updating ETA…' : etaMinutes === 0 ? 'Delivered' : `${etaMinutes}–${etaMinutes + 5} min`,
      partnerLocation: partnerLocation ? { latitude: Number(partnerLocation.latitude), longitude: Number(partnerLocation.longitude), heading: Number(partnerLocation.heading || 0), updatedAt: partnerLocation.createdAt } : null,
    };
  }

  async updateOrderStatus(user: AuthUser, orderId: string, dto: UpdateGroceryStatusDto) {
    const order = await this.prisma.groceryOrder.findUnique({ where: { id: orderId }, include: { partner: true, store: true } });
    if (!order) throw new NotFoundException('Grocery order not found');
    const partnerOwnsOrder = user.role === Role.PARTNER && order.partner?.userId === user.sub;
    const operator = user.role === Role.ADMIN || (user.role === Role.STORE_OWNER && order.store.ownerId === user.sub);
    if (!partnerOwnsOrder && !operator) throw new BadRequestException('You cannot update this order');

    const allowed: Partial<Record<GroceryOrderStatus, GroceryOrderStatus[]>> = {
      [GroceryOrderStatus.CONFIRMED]: [GroceryOrderStatus.PACKING, GroceryOrderStatus.CANCELLED],
      [GroceryOrderStatus.PACKING]: [GroceryOrderStatus.SEARCHING_PARTNER, GroceryOrderStatus.CANCELLED],
      [GroceryOrderStatus.SEARCHING_PARTNER]: [GroceryOrderStatus.ASSIGNED, GroceryOrderStatus.CANCELLED],
      [GroceryOrderStatus.ASSIGNED]: [GroceryOrderStatus.PICKED_UP, GroceryOrderStatus.CANCELLED],
      [GroceryOrderStatus.PICKED_UP]: [GroceryOrderStatus.DELIVERED],
    };
    if (!allowed[order.status]?.includes(dto.status)) throw new BadRequestException(`Cannot move order from ${order.status} to ${dto.status}`);
    const result = await this.commitStatus(order.id, order.customerId, dto.status, dto.detail, user.sub);
    if (dto.status === GroceryOrderStatus.DELIVERED && order.partnerId) {
      await this.prisma.$transaction([
        this.prisma.dispatchJob.updateMany({ where: { groceryOrderId: order.id }, data: { status: DispatchStatus.COMPLETED } }),
        this.prisma.partner.update({ where: { id: order.partnerId }, data: { status: PartnerStatus.ONLINE, activeOrderId: null, activeOrderType: null } }),
      ]);
    }
    return result;
  }

  async createSupportRequest(customerId: string, orderId: string, dto: CreateSupportRequestDto) {
    const order = await this.prisma.groceryOrder.findFirst({ where: { id: orderId, customerId } });
    if (!order) throw new NotFoundException('Grocery order not found');
    const existing = await this.prisma.grocerySupportRequest.findFirst({ where: { orderId, customerId, category: dto.category, status: { in: [SupportRequestStatus.OPEN, SupportRequestStatus.IN_PROGRESS] } } });
    if (existing) return existing;
    const request = await this.prisma.grocerySupportRequest.create({ data: { orderId, customerId, category: dto.category, message: dto.message } });
    await this.notifications.notify(customerId, 'Support request received', `We’re reviewing your ${dto.category.toLowerCase()} request.`, { type: 'GROCERY_SUPPORT', orderId, supportRequestId: request.id });
    return request;
  }

  private async commitStatus(orderId: string, customerId: string, status: GroceryOrderStatus, detail?: string, actorId?: string) {
    const copy: Record<GroceryOrderStatus, { title: string; body: string }> = {
      CREATED: { title: 'Order created', body: 'Complete payment to confirm your order.' },
      CONFIRMED: { title: 'Order confirmed', body: 'The store has received your order.' },
      PACKING: { title: 'Packing your groceries', body: 'Fresh items are being carefully packed.' },
      SEARCHING_PARTNER: { title: 'Finding a delivery partner', body: 'We’ll assign a nearby partner shortly.' },
      ASSIGNED: { title: 'Delivery partner assigned', body: 'Your delivery partner is heading to the store.' },
      PICKED_UP: { title: 'Order picked up', body: 'Your groceries are on the way.' },
      DELIVERED: { title: 'Order delivered', body: 'Your groceries have arrived. Enjoy!' },
      CANCELLED: { title: 'Order cancelled', body: detail || 'This order was cancelled.' },
    };
    const eventCopy = copy[status];
    const [order, event] = await this.prisma.$transaction([
      this.prisma.groceryOrder.update({ where: { id: orderId }, data: { status } }),
      this.prisma.groceryOrderStatusEvent.create({ data: { orderId, status, title: eventCopy.title, detail: detail || eventCopy.body, actorId } }),
    ]);
    const payload = { orderId, status, title: eventCopy.title, detail: detail || eventCopy.body, event, updatedAt: order.updatedAt };
    this.realtime.emitToOrder('GROCERY', orderId, 'grocery_order_updated', payload);
    this.realtime.emitToUser(customerId, 'grocery_order_updated', payload);
    await this.notifications.notify(customerId, eventCopy.title, detail || eventCopy.body, { type: 'GROCERY_ORDER', orderId, status });
    return payload;
  }

  async createOrder(customerId: string, dto: CreateGroceryOrderDto) {
    const serviceability = await this.checkServiceability(dto.deliveryLat, dto.deliveryLng);
    if (!serviceability.serviceable || serviceability.store?.id !== dto.storeId) {
      throw new BadRequestException('This store cannot deliver to the selected address');
    }
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((item) => item.productId) }, storeId: dto.storeId, isActive: true },
    });
    if (products.length !== dto.items.length) throw new BadRequestException('One or more products are unavailable');
    const insufficientItem = dto.items.find((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return !product || product.stock < item.quantity;
    });
    if (insufficientItem) throw new BadRequestException('One or more products do not have enough stock');

    const subtotal = dto.items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return sum + Number(product?.price || 0) * item.quantity;
    }, 0);
    const deliveryFee = 30;

    const order = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.groceryOrder.create({
        data: {
          sourceApp: dto.sourceApp,
          customerId,
          storeId: dto.storeId,
          status: GroceryOrderStatus.CREATED,
          deliveryAddress: dto.deliveryAddress,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          items: {
            create: dto.items.map((item) => {
              const product = products.find((entry) => entry.id === item.productId)!;
              return { productId: product.id, quantity: item.quantity, unitPrice: product.price };
            }),
          },
        },
        include: { store: true, items: true },
      });
      await transaction.groceryOrderStatusEvent.create({ data: { orderId: created.id, status: GroceryOrderStatus.CREATED, title: 'Order created', detail: 'Complete payment to confirm your order.' } });

      for (const item of dto.items) {
        const updated = await transaction.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity }, isActive: true },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException('A product went out of stock during checkout');
        }
      }

      await transaction.groceryCart.deleteMany({ where: { customerId } });

      return created;
    });

    return { order };
  }

  async cancelUnpaidOrder(customerId: string, orderId: string) {
    const order = await this.prisma.groceryOrder.findFirst({
      where: { id: orderId, customerId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Grocery order not found');
    if (order.status !== GroceryOrderStatus.CREATED) {
      return { cancelled: false, status: order.status };
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.groceryOrder.update({ where: { id: order.id }, data: { status: GroceryOrderStatus.CANCELLED } });
      const cart = await transaction.groceryCart.upsert({
        where: { customerId },
        update: { storeId: order.storeId },
        create: { customerId, storeId: order.storeId },
      });
      for (const item of order.items) {
        await transaction.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await transaction.groceryCartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
          update: { quantity: item.quantity, unitPrice: item.unitPrice },
          create: { cartId: cart.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice },
        });
      }
      await transaction.payment.updateMany({
        where: { groceryOrderId: order.id, status: { in: [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED] } },
        data: { status: PaymentStatus.FAILED, failureReason: 'Checkout abandoned' },
      });
    });
    return { cancelled: true };
  }
}
