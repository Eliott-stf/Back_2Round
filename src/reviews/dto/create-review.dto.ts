import { IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'La note doit être un nombre.' })
  @Min(1, { message: 'La note doit être comprise entre 1 et 5.' })
  @Max(5, { message: 'La note doit être comprise entre 1 et 5.' })
  rating!: number;

  @IsOptional()
  @IsString({ message: 'Le commentaire est invalide.' })
  @MaxLength(500, { message: 'Le commentaire ne peut pas dépasser 500 caractères.' })
  comment?: string;
}