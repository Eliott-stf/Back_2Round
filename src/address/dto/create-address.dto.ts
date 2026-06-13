import { IsEnum, IsOptional, IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { AddressType } from '../../generated/prisma/enums';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Le type d\'adresse est obligatoire.' })
  @IsEnum(AddressType, { message: 'Le type d\'adresse sélectionné n\'est pas valide.' })
  type!: AddressType;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un numéro de rue valide.' })
  @MaxLength(20, { message: 'Le numéro de rue est trop long.' })
  @Matches(/^[^<>]*$/, { message: 'Les caractères < et > ne sont pas autorisés dans le numéro.' })
  streetNumber?: string;

  @IsNotEmpty({ message: 'Le nom de la rue est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner le nom de la rue.' })
  @MinLength(2, { message: 'Le nom de la rue doit contenir au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom de la rue est trop long.' })
  @Matches(/^[a-zA-ZÀ-ÿ0-9][a-zA-ZÀ-ÿ0-9\s',.-]*$/, { message: 'Veuillez n\'utiliser que des lettres, chiffres, espaces ou tirets pour la rue, et ne commencez pas par un espace.' })
  streetName!: string;

  @IsNotEmpty({ message: 'La ville est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner le nom de la ville.' })
  @MinLength(2, { message: 'Le nom de la ville doit contenir au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom de la ville est trop long.' })
  @Matches(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*$/, { message: 'Veuillez n\'utiliser que des lettres, espaces ou tirets pour la ville, et ne commencez pas par un espace.' })
  city!: string;

  @IsNotEmpty({ message: 'Le code postal est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner un code postal.' })
  @MinLength(3, { message: 'Le code postal doit contenir au moins 3 caractères.' })
  @MaxLength(20, { message: 'Le code postal est trop long.' })
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-]*$/, { message: 'Veuillez renseigner un code postal valide sans espace au début.' })
  zipCode!: string;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un complément d\'adresse valide.' })
  @MaxLength(255, { message: 'Le complément d\'adresse est trop long.' })
  @Matches(/^[^<>]*$/, { message: 'Les caractères < et > ne sont pas autorisés dans le complément.' })
  additionalInfo?: string;
}