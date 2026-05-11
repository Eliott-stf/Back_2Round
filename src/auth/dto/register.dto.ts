import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsString()
  lastname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  boxingType?: string;
}