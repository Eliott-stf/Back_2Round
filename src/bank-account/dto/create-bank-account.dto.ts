import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @MinLength(14)
  iban!: string;

  @IsString()
  @MinLength(8)
  bic!: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}