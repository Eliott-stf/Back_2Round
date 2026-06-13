import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateAttributeDto {
  @IsOptional()
  @IsString({ message: 'Le type de l\'attribut doit être une chaîne de caractères.' })
  @MinLength(2, { message: 'Le type de l\'attribut doit faire au moins 2 caractères.' })
  @MaxLength(50, { message: 'Le type de l\'attribut doit faire au maximum 50 caractères.' })
  @Matches(/^[a-z0-9_]+$/, { message: 'Le type de l\'attribut doit contenir uniquement des lettres minuscules, chiffres ou underscores.' })
  type?: string;

  @IsOptional()
  @IsString({ message: 'La valeur doit être une chaîne de caractères.' })
  @MinLength(1, { message: 'La valeur de l\'attribut doit faire au moins 1 caractère.' })
  @MaxLength(50, { message: 'La valeur de l\'attribut doit faire au maximum 50 caractères.' })
  @Matches(/^[a-zA-Z0-9\s'.-]+$/, { message: 'Veuillez spécifier une valeur valide.' })
  value?: string;
}
