import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { grpcCartModuleClientOptions } from '../grpc-client.option';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;

  // Mock de produtos enviados para checkout
  const mockProductsCart = {
    products: [
      {
        id: 1,
        quantity: 1,
      },
    ],
  };

  // Mock de produto não encontrado
  const mockProductsCartNotFound = {
    products: [
      {
        id: 100,
        quantity: 1,
      },
    ],
  };

  // Mock de produto "gift"
  const mockProductsCartGift = {
    products: [
      {
        id: 6,
        quantity: 1,
      },
    ],
  };

  // Mock resposta checkout padrão
  const mockCheckoutResponse = {
    total_amount: 15157,
    total_amount_with_discount: 15157,
    total_discount: 0,
    products: [
      {
        id: 1,
        quantity: 1,
        unit_amount: 15157,
        total_amount: 15157,
        discount: 0,
        is_gift: false,
      },
    ],
  };

  // Mock resposta checkout com desconto
  const mockCheckoutResponseWithDiscount = {
    total_amount: 15157,
    total_amount_with_discount: 14399,
    total_discount: 758,
    products: [
      {
        id: 1,
        quantity: 1,
        unit_amount: 15157,
        total_amount: 15157,
        discount: 758,
        is_gift: false,
      },
    ],
  };

  // Mock resposta checkout na Black Friday
  const mockCheckoutResponseBf = {
    total_amount: 15157,
    total_amount_with_discount: 15157,
    total_discount: 0,
    products: [
      {
        id: 1,
        quantity: 1,
        unit_amount: 15157,
        total_amount: 15157,
        discount: 0,
        is_gift: false,
      },
      {
        id: 6,
        quantity: 1,
        unit_amount: 0,
        total_amount: 0,
        discount: 0,
        is_gift: true,
      },
    ],
  };

  // Mock resposta checkout na Black Friday com Desconto
  const mockCheckoutResponseWithDiscountBf = {
    total_amount: 15157,
    total_amount_with_discount: 14399,
    total_discount: 758,
    products: [
      {
        id: 1,
        quantity: 1,
        unit_amount: 15157,
        total_amount: 15157,
        discount: 758,
        is_gift: false,
      },
      {
        id: 6,
        quantity: 1,
        unit_amount: 0,
        total_amount: 0,
        discount: 0,
        is_gift: true,
      },
    ],
  };

  // Mock porcentagem de desconto
  const mockDiscountServer = {
    percentage: 0.05,
  };

  // Mock porcentagem de desconto
  const mockNoDiscountServer = {
    percentage: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CartService,
        {
          provide: 'DISCOUNT_PACKAGE',
          useFactory: (configService: ConfigService) => {
            return ClientProxyFactory.create({
              ...grpcCartModuleClientOptions,
            });
          },
          inject: [ConfigService],
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When makes cart checkout', () => {
    it('Should checkout', async () => {
      jest
        .spyOn(service, 'getGrpcDiscount')
        .mockReturnValueOnce(
          new Promise((resolve) => resolve(mockNoDiscountServer)),
        );

      const result = await service.checkout(mockProductsCart);

      expect(result).toBeDefined();
      expect(result).toEqual(mockCheckoutResponse);
    });

    it('Should checkout with Discount', async () => {
      jest
        .spyOn(service, 'getGrpcDiscount')
        .mockReturnValueOnce(
          new Promise((resolve) => resolve(mockDiscountServer)),
        );

      const result = await service.checkout(mockProductsCart);

      expect(result).toBeDefined();
      expect(result).toEqual(mockCheckoutResponseWithDiscount);
    });
  });

  describe('When makes a cart checkout on Black Friday', () => {
    it('Should checkout', async () => {
      jest
        .spyOn(service, 'getGrpcDiscount')
        .mockReturnValueOnce(
          new Promise((resolve) => resolve(mockNoDiscountServer)),
        );

      jest.spyOn(service, 'verifyBlackFridayDate').mockReturnValue(true);

      const result = await service.checkout(mockProductsCart);

      expect(result).toBeDefined();
      expect(result).toEqual(mockCheckoutResponseBf);
    });

    it('Should checkout with Discount', async () => {
      jest
        .spyOn(service, 'getGrpcDiscount')
        .mockReturnValueOnce(
          new Promise((resolve) => resolve(mockDiscountServer)),
        );

      jest.spyOn(service, 'verifyBlackFridayDate').mockReturnValue(true);

      const result = await service.checkout(mockProductsCart);

      expect(result).toBeDefined();
      expect(result).toEqual(mockCheckoutResponseWithDiscountBf);
    });
  });

  describe('When send a product gift', () => {
    it('Should be an exception that product not allowed', async () => {
      try {
        await service.checkout(mockProductsCartGift);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getResponse()).toBe(
          'O produto com id 6 não pode ser adicionado ao carrinho!',
        );
        expect(error.getStatus()).toBe(400);
      }
    });
  });

  describe('When send a product that not exist', () => {
    it('Should be an exception that product not found', async () => {
      try {
        await service.checkout(mockProductsCartNotFound);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getResponse().message).toBe(
          'O produto com id 100 não foi encontrado!',
        );
        expect(error.getStatus()).toBe(404);
      }
    });
  });
});
