import { IsString, IsOptional, IsUUID, ValidateIf, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString({ message: 'Les détails du signalement sont invalides.' })
  @MaxLength(1000, { message: 'Les détails du signalement ne peuvent dépasser 1000 caractères.' })
  content?: string;

  @ValidateIf(o => !o.conversationId)
  @IsUUID('all', { message: 'L\'identifiant du produit est invalide.' })
  productId?: string;

  @ValidateIf(o => !o.productId)
  @IsUUID('all', { message: 'L\'identifiant de la conversation est invalide.' })
  conversationId?: string;

  @IsUUID('all', { message: 'Le type de signalement est invalide.' })
  typeReportId!: string;
}