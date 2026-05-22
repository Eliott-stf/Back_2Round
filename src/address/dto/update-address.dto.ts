import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AddressType } from '../../generated/prisma/enums';

export class UpdateAddressDto {
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @IsOptional()
  @IsString()
  streetNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  streetName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  zipCode?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}