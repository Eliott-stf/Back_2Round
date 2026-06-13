import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, MinLength, MaxLength, Matches, Max, IsUUID } from 'class-validator';
import { ProductCondition, ProductStatus } from '../../generated/prisma/enums';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @MinLength(3, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @MaxLength(100, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s'.-]+$/, { message: 'Veuillez renseigner un titre valide pour votre annonce.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  @MinLength(10, { message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  @MaxLength(2000, { message: 'Veuillez renseigner une description valide (entre 10 et 2000 caractères).' })
  description?: string;

  @IsOptional()
  @IsEnum(ProductCondition, { message: 'État du produit invalide.' })
  condition?: ProductCondition;

  @IsOptional()
  @IsUUID('all', { each: true, message: 'Les attributs fournis sont invalides.' })
  attributeIds?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Veuillez renseigner un prix valide.' })
  @IsPositive({ message: 'Veuillez renseigner un prix valide supérieur à 0.' })
  @Max(1000, { message: 'Veuillez renseigner un prix valide inférieur à 1000€.' })
  price?: number;

  @IsOptional()
  @IsUUID('all', { message: 'La catégorie sélectionnée est invalide.' })
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Statut du produit invalide.' })
  status?: ProductStatus;
}