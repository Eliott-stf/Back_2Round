import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, MinLength, MaxLength, Matches, IsNotEmpty, Max, IsUUID } from 'class-validator';
import { ProductCondition } from '../../generated/prisma/enums';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @IsString({ message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @MinLength(3, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @MaxLength(100, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s'.-]+$/, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  title!: string;

  @IsNotEmpty({ message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  @IsString({ message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  @MinLength(10, { message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  @MaxLength(2000, { message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  description!: string;

  @IsEnum(ProductCondition, { message: 'État du produit invalide.' })
  condition!: ProductCondition;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner une taille valide.' })
  @MaxLength(20, { message: 'Veuillez renseigner une taille valide.' })
  @Matches(/^[a-zA-Z0-9\s-]+$/, { message: 'Veuillez renseigner une taille valide.' })
  size?: string;

  @IsNumber({}, { message: 'Veuillez renseigner un prix valide.' })
  @IsPositive({ message: 'Veuillez renseigner un prix valide supérieur à 0.' })
  @Max(1000, { message: 'Veuillez renseigner un prix valide inférieur à 1000€.' })
  price!: number;

  @IsNotEmpty({ message: 'La catégorie sélectionnée est invalide.' })
  @IsUUID('all', { message: 'La catégorie sélectionnée est invalide.' })
  categoryId!: string;
}