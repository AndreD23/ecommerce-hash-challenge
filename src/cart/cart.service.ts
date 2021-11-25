import { Inject, OnModuleInit } from '@nestjs/common';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { Observable } from 'rxjs';
import { Discount } from '../interfaces/discount.interface';
import { ClientGrpc } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from './entities/product.entity';

interface DiscountService {
  getDiscount(productId: number): Observable<any>;
}

export class CartService implements OnModuleInit {
  private discountService: DiscountService;

  constructor(@Inject('DISCOUNT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.discountService = this.client.getService<DiscountService>('Discount');
  }

  Products = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'products.json'), 'utf-8'),
  );

  checkout(checkoutCartDto: CheckoutCartDto) {
    // Extrai as informações do BD
    const productsCheckout = checkoutCartDto.products.map((productCart) => {
      return this.getProductsDetails(productCart);
    });

    // Verifica se há estoque suficiente

    // Verificar se o serviço de desconto está disponível

    // Verificar valor com desconto

    // this.getGrpcDiscount();

    // Verificar se é black friday
    // Se for, adicionar produto brinde no carrinho
    // Produto brinde possui flag is_gift = true
    // Só pode haver 1 produto brinde no carrinho
  }

  private getProductsDetails(data) {
    const productsBD = this.Products;
    return productsBD.find((product) => product.id === data.id);
  }

  // private getGrpcDiscount(productId: number): Observable<Discount> {
  //   return this.discountService.getDiscount(productId);
  // }
}
