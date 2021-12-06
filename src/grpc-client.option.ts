import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcCartModuleClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'grpc:50051',
    package: 'discount',
    protoPath: join(__dirname, './cart/proto/discount.proto'),
  },
};
