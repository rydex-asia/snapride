import { Body, Controller, Get, Headers, HttpCode, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthUser } from '../../shared/types/auth-user.type';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentOrderDto) {
    return this.payments.createOrder(user.sub, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verify(@CurrentUser() user: AuthUser, @Body() dto: VerifyPaymentDto) {
    return this.payments.verify(user.sub, dto);
  }

  @Get(':paymentId')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: AuthUser, @Param('paymentId') paymentId: string) {
    return this.payments.getStatus(user.sub, paymentId);
  }

  @Post('webhooks/cashfree')
  @HttpCode(200)
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-webhook-signature') signature = '',
    @Headers('x-webhook-timestamp') timestamp = '',
    @Headers('x-idempotency-key') eventId = '',
  ) {
    return this.payments.handleCashfreeWebhook(request.rawBody, signature, timestamp, eventId, request.body);
  }
}
