import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { grpcCartModuleClientOptions } from '../grpc-client.option';

// @Module({
//   imports: [
//     ClientsModule.register([
//       {
//         name: 'DISCOUNT_PACKAGE',
//         ...grpcCartModuleClientOptions,
//       },
//     ]),
//   ],
//   controllers: [CartController],
//   providers: [CartService],
// })

@Module({
  imports: [ConfigModule],
  controllers: [CartController],
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
})
export class CartModule {}
