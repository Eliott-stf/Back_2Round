import { IsString, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  content?: string;

  @ValidateIf(o => !o.conversationId)
  @IsUUID()
  productId?: string;

  @ValidateIf(o => !o.productId)
  @IsUUID()
  conversationId?: string;
}