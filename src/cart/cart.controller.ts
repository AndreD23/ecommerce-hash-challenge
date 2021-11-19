import { Controller, Post, Body } from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutCartDto } from './dto/checkout-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('checkout')
  checkout(@Body() checkoutCartDto: CheckoutCartDto) {
    return this.cartService.checkout(checkoutCartDto);
  }
}
