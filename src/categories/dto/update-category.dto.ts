import { IsString, IsOptional, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un nom de catégorie valide.' })
  @MinLength(2, { message: 'Veuillez renseigner un nom de catégorie valide.' })
  @MaxLength(50, { message: 'Veuillez renseigner un nom de catégorie valide.' })
  @Matches(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*$/, { message: 'Veuillez renseigner un nom de catégorie valide.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Veuillez renseigner un slug valide.' })
  @MinLength(2, { message: 'Veuillez renseigner un slug valide.' })
  @MaxLength(50, { message: 'Veuillez renseigner un slug valide.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Veuillez renseigner un slug valide.' })
  slug?: string;

  @IsOptional()
  @IsUUID('all', { message: 'L\'identifiant de la catégorie parente est invalide.' })
  parentId?: string;
}