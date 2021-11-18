import { Injectable } from '@nestjs/common';
import { CheckoutCartDto } from './dto/checkout-cart.dto';

@Injectable()
export class CartService {
  checkout(checkoutCartDto: CheckoutCartDto) {
    return 'This action makes a cart checkout';
  }
}
