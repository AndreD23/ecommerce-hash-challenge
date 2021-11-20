import { OnModuleInit } from '@nestjs/common';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface DiscountGrpcService {
  getDiscount(data: { name: string; price: number }): Observable<any>;
}

@Controller('discount-grpc-clients')
export class DiscountGrpcClientController implements OnModuleInit {
  private discountGrpcService: DiscountGrpcService;

  constructor(@Inject('DISCOUNT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.discountGrpcService =
      this.client.getService<DiscountGrpcService>('DiscountService');
  }

  @Post()
  async getDiscount(@Body() data) {
    try {
      await this.discountGrpcService.getDiscount(data).toPromise();
    } catch (e) {
      throw new RpcException({ code: e.code, message: e.message });
    }
  }
}
