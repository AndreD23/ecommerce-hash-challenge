import { Inject, OnModuleInit } from '@nestjs/common';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { Observable } from 'rxjs';
import { Discount } from '../interfaces/discount.interface';
import { ClientGrpc } from '@nestjs/microservices';

interface DiscountService {
  getDiscount(productId: number): Observable<any>;
}

export class CartService implements OnModuleInit {
  private discountService: DiscountService;

  constructor(@Inject('DISCOUNT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.discountService = this.client.getService<DiscountService>('Discount');
  }

  checkout(checkoutCartDto: CheckoutCartDto) {
    const productId = 1;

    this.getGrpcDiscount(productId);
    return 'This action makes a cart checkout';
  }

  private getGrpcDiscount(productId: number): Observable<Discount> {
    return this.discountService.getDiscount(productId);
  }
}
