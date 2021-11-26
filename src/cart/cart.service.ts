import {
  HttpException,
  Inject,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
    let cartTotalDiscount = 0;

    // Extrai as informações do BD
    const productsCheckout = this.productsDetails(checkoutCartDto.products);

    for (const product of productsCheckout) {
      cartTotalAmount += product.total_amount;

      // Verificar valor com desconto
      product.discount = await this.calculateDiscount(product);

      cartTotalDiscount += product.discount;
    }

    // Verificar se é black friday
    if (this.verifyBlackFridayDate()) {
      // Adiciona um produto de brinde
      const productGift = this.addProductGift(productsCheckout);
      if (productGift) {
        productsCheckout.push(productGift);
      }
    }

    const cartTotalAmountWithDiscount = cartTotalAmount - cartTotalDiscount;

    return {
      total_amount: cartTotalAmount,
      total_amount_with_discount: cartTotalAmountWithDiscount,
      total_discount: cartTotalDiscount,
      products: productsCheckout,
    };
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

      // Verifica se é um produto brinde
      if (resultProduct.is_gift) {
        throw new HttpException(
          `O produto com id ${productCart.id} não pode ser adicionado ao carrinho!`,
          400,
        );
      }

      const product = new ProductCart();
      product.id = resultProduct.id;
      product.quantity = productCart.quantity;
      product.unit_amount = resultProduct.amount;
      product.total_amount = product.unit_amount * product.quantity;
      product.discount = 0;
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

  /**
   * Método auxiliar que verifica se a data atual é de black friday
   * @private
   */
  private verifyBlackFridayDate() {
    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const newdate = month + '/' + day;
    const blackFridayDate = '11/26';

    return newdate === blackFridayDate;
  }

  /**
   * Método que adiciona um produto brinde ao carrinho
   * Recebe como parâmetro os produtos que estão no carrinho momento,
   * para verificar a existência de um brinde no carrinho
   * @param productsCart
   * @private
   */
  private addProductGift(productsCart) {
    const productsBD = this.Products;

    // Busca por produtos que são brinde
    const giftProductResult = productsBD.find(
      (product) => product.is_gift === true,
    );

    // Verifica se o produto já está adicionado no carrinho
    const productAlreadyInCart = productsCart.find(
      (product) => product.id === giftProductResult.id,
    );

    if (productAlreadyInCart) {
      return false;
    }

    // Retorna o produto brinde
    const product = new ProductCart();
    product.id = giftProductResult.id;
    product.quantity = 1;
    product.unit_amount = 0;
    product.total_amount = 0;
    product.discount = 0;
    product.is_gift = true;
    return product;
  }
}
