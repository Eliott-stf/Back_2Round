import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  productId!: string;

  @IsString()
  conversationId!: string;

  @IsNumber()
  @IsPositive()
  proposedPrice!: number;
}