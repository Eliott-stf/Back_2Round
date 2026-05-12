import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ProductCondition } from '../../generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(ProductCondition)
  condition!: ProductCondition;

  @IsOptional()
  @IsString()
  size?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  categoryId!: string;
}