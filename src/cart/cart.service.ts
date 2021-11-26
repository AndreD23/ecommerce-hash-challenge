import { Inject, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { Observable } from 'rxjs';
import { Discount } from '../interfaces/discount.interface';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from './entities/product.entity';
import { ProductCart } from './entities/cart.entity';

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

  async checkout(checkoutCartDto: CheckoutCartDto) {
    let cartTotalAmount = 0;
    const cartTotalAmountWithDiscount = 0;
    let cartTotalDiscount = 0;

    // Extrai as informações do BD
    const productsCheckout = this.productsDetails(checkoutCartDto.products);

    for (const product of productsCheckout) {
      cartTotalAmount += product.total_amount;

      // Verificar valor com desconto
      product.discount = await this.calculateDiscount(product);

      cartTotalDiscount += product.discount;
    }

    console.log(productsCheckout, cartTotalAmount, cartTotalDiscount);

    // Verificar se é black friday
    // Se for, adicionar produto brinde no carrinho
    // Produto brinde possui flag is_gift = true
    // Só pode haver 1 produto brinde no carrinho
  }

  /**
   * Método auxiliar que buscará pelos produtos no BD
   * @param produtos array de produtos do carrinho
   * @private
   */
  private productsDetails(produtos) {
    return produtos.map((productCart) => {
      const resultProduct = this.getProduct(productCart.id);

      // Verifica se o produto existe no BD
      if (!resultProduct) {
        throw new NotFoundException(
          `O produto com id ${productCart.id} não foi encontrado!`,
        );
      }

      const product = new ProductCart();
      product.id = resultProduct.id;
      product.quantity = productCart.quantity;
      product.unit_amount = resultProduct.amount;
      product.total_amount = product.unit_amount * product.quantity;
      product.is_gift = resultProduct.is_gift;
      return product;
    });
  }

  /**
   * Busca por um produto no banco de dados
   * @param productId identificador do produto a ser buscado
   * @return Product
   * @private
   */
  private getProduct(productId): Product {
    const productsBD = this.Products;
    return productsBD.find((product) => product.id === productId);
  }

  /**
   * Método auxiliar que realiza o cálculo do valor de desconto do produto
   * @param product
   * @private
   */
  private async calculateDiscount(product: ProductCart) {
    const resultDiscount = await this.getGrpcDiscount(product.id);

    if (Object.keys(resultDiscount).length === 0) {
      return 0;
    }

    const discountPercentage = Number(resultDiscount.percentage.toFixed(2));

    return (
      Number(((product.total_amount / 100) * discountPercentage).toFixed(2)) *
      100
    );
  }

  /**
   * Método de comunicação com o servidor de descontos
   * Obtém o desconto de um produto através de seu identificador
   * @param productId
   * @private
   */
  private async getGrpcDiscount(productId: number): Promise<Discount> {
    try {
      return await this.discountService.getDiscount(productId).toPromise();
    } catch (error) {
      throw new RpcException({ code: error.code, message: error.message });
    }
  }
}
