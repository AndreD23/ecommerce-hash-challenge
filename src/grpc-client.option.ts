import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcCartModuleClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'app:50051',
    package: 'discount',
    protoPath: join(__dirname, './cart/proto/discount.proto'),
  },
};

export const grpcMainClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: '0.0.0.0:50051',
    package: 'discount',
    protoPath: join(__dirname, './cart/proto/discount.proto'),
  },
};
