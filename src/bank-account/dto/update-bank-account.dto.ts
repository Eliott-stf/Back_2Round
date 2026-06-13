import { IsBoolean, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un IBAN valide.' })
  @MinLength(14, { message: 'Veuillez renseigner un IBAN valide.' })
  @MaxLength(34, { message: 'Veuillez renseigner un IBAN valide.' })
  @Matches(/^[A-Z0-9\s]+$/, { message: 'Veuillez renseigner un IBAN valide.' })
  iban?: string;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un BIC valide.' })
  @MinLength(8, { message: 'Veuillez renseigner un BIC valide.' })
  @MaxLength(11, { message: 'Veuillez renseigner un BIC valide.' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Veuillez renseigner un BIC valide.' })
  bic?: string;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un nom de titulaire valide.' })
  @MinLength(2, { message: 'Veuillez renseigner un nom de titulaire valide.' })
  @MaxLength(100, { message: 'Veuillez renseigner un nom de titulaire valide.' })
  @Matches(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*$/, { message: 'Veuillez renseigner un nom de titulaire valide.' })
  ownerName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}