import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AddressType } from '../../generated/prisma/enums';

export class CreateAddressDto {
  @IsEnum(AddressType)
  type!: AddressType;

  @IsOptional()
  @IsString()
  streetNumber?: string;

  @IsString()
  @MinLength(2)
  streetName!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @MinLength(3)
  zipCode!: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}