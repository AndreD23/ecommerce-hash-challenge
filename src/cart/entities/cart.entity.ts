export class ProductCart {
  id: number;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  discount: number;
  is_gift: boolean;
}

export class Cart {
  total_amount: number;
  total_amount_with_discount: number;
  total_discount: number;
  products: ProductCart[];
}
