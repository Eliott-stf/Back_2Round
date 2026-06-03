import { IsString, IsArray, ValidateNested, IsInt, IsPositive, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  shippingAddressId!: string;

  @IsString()
  @IsNotEmpty()
  billingAddressId!: string;

  @IsOptional()
  @IsString()
  offerId?: string;
}