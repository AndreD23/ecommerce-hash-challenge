import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ProductCheckoutCartDTO {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutCartDto {
  @IsNotEmpty()
  products: ProductCheckoutCartDTO[];
}
