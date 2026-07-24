import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreateGroceryOrderDto } from './dto/create-grocery-order.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { GroceryService } from './grocery.service';
import { SetCartItemDto } from './dto/set-cart-item.dto';
import { DeliveryAddressDto } from './dto/delivery-address.dto';
import { ServiceabilityDto } from './dto/serviceability.dto';
import { UpdateGroceryStatusDto } from './dto/update-grocery-status.dto';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@ApiTags('grocery')
@ApiBearerAuth()
@Controller('grocery')
export class GroceryController {
  constructor(private readonly grocery: GroceryService) {}

  @Get('catalog')
  catalog(@Query() query: CatalogQueryDto) {
    return this.grocery.listCatalog(query);
  }

  @Post('serviceability')
  serviceability(@Body() dto: ServiceabilityDto) {
    return this.grocery.checkServiceability(dto.latitude, dto.longitude);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  addresses(@CurrentUser() user: AuthUser) {
    return this.grocery.listAddresses(user.sub);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  createAddress(@CurrentUser() user: AuthUser, @Body() dto: DeliveryAddressDto) {
    return this.grocery.saveAddress(user.sub, dto);
  }

  @Put('addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  updateAddress(
    @CurrentUser() user: AuthUser,
    @Param('addressId') addressId: string,
    @Body() dto: DeliveryAddressDto,
  ) {
    return this.grocery.saveAddress(user.sub, dto, addressId);
  }

  @Delete('addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  deleteAddress(@CurrentUser() user: AuthUser, @Param('addressId') addressId: string) {
    return this.grocery.deleteAddress(user.sub, addressId);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  orders(@CurrentUser() user: AuthUser) {
    return this.grocery.listOrders(user.sub);
  }

  @Get('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  order(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string) {
    return this.grocery.getOrderTracking(user, orderId);
  }

  @Post('orders/:orderId/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string, @Body() dto: UpdateGroceryStatusDto) {
    return this.grocery.updateOrderStatus(user, orderId, dto);
  }

  @Post('orders/:orderId/support')
  @UseGuards(JwtAuthGuard)
  support(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string, @Body() dto: CreateSupportRequestDto) {
    return this.grocery.createSupportRequest(user.sub, orderId, dto);
  }

  @Get('cart')
  @UseGuards(JwtAuthGuard)
  cart(@CurrentUser() user: AuthUser) {
    return this.grocery.getCart(user.sub);
  }

  @Put('cart/items/:productId')
  @UseGuards(JwtAuthGuard)
  setCartItem(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: SetCartItemDto,
  ) {
    return this.grocery.setCartItem(user.sub, productId, dto.quantity);
  }

  @Post('cart/validate')
  @UseGuards(JwtAuthGuard)
  validateCart(@CurrentUser() user: AuthUser) {
    return this.grocery.validateCart(user.sub);
  }

  @Delete('cart')
  @UseGuards(JwtAuthGuard)
  clearCart(@CurrentUser() user: AuthUser) {
    return this.grocery.clearCart(user.sub);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: AuthUser, @Body() dto: CreateGroceryOrderDto) {
    return this.grocery.createOrder(user.sub, dto);
  }

  @Post('orders/:orderId/cancel-unpaid')
  @UseGuards(JwtAuthGuard)
  cancelUnpaidOrder(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string) {
    return this.grocery.cancelUnpaidOrder(user.sub, orderId);
  }
}
