import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ClientsModule } from '@nestjs/microservices';
import { grpcCartModuleClientOptions } from '../grpc-client.option';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DISCOUNT_PACKAGE',
        ...grpcCartModuleClientOptions,
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
