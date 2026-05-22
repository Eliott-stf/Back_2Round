import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(14)
  iban?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  bic?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  ownerName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}