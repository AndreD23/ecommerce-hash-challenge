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
    const productsCheckout = checkoutCartDto.products.map(
      async (productCart) => {
        const product = this.getProductsDetails(productCart.id);

        // Verifica se o produto existe no BD
        if (!product) {
          throw new NotFoundException(
            `O produto com id ${productCart.id} não foi encontrado!`,
          );
        }

        // Verifica se há estoque suficiente
        if (
          !CartService.productHasStock(product.amount, productCart.quantity)
        ) {
          throw new HttpException(
            `Não há estoque suficiente para o produto ${productCart.id}`,
            400,
          );
        }

        // Verificar valor com desconto
        const productDiscount = await this.getGrpcDiscount(product.id);
        console.log(
          `### Este é o desconto retornado do produto ${product.id}:`,
        );
        console.log(productDiscount);

        return product;
      },
    );

    // Verificar se é black friday
    // Se for, adicionar produto brinde no carrinho
    // Produto brinde possui flag is_gift = true
    // Só pode haver 1 produto brinde no carrinho
  }

  /**
   * Busca por um produto no banco de dados
   * @param productId identificador do produto a ser buscado
   * @return Product
   * @private
   */
  private getProductsDetails(productId): Product {
    const productsBD = this.Products;
    return productsBD.find((product) => product.id === productId);
  }

  /**
   * Método auxiliar que verifica se o produto tem estoque
   * e se o estoque disponível é mais do que o solicitado
   * @param productStock Quantidade atual de produto no BD
   * @param requiredAmount Quantidade solicitada no carrinho
   * @returns boolean TRUE para caso tenha estoque suficiente, FALSE caso contrário
   * @private
   */
  private static productHasStock(productStock, requiredAmount): boolean {
    return !(productStock <= 0 || productStock < requiredAmount);
  }

  private async getGrpcDiscount(
    productId: number,
  ): Promise<Observable<Discount>> {
    try {
      return await this.discountService.getDiscount(productId).toPromise();
    } catch (error) {
      throw new RpcException({ code: error.code, message: error.message });
    }
  }
}
