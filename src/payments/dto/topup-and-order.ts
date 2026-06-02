import { IsNumber, IsNotEmpty, IsPositive, IsObject } from 'class-validator';

export class TopupAndOrderDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  missingAmount!: number;

  @IsObject()
  @IsNotEmpty()
  orderDto: any; 
}