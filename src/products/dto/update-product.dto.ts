import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ProductCondition } from '../../generated/prisma/enums';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}