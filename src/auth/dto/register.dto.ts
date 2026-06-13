import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNumber, Matches, Min, Max, IsIn, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner un prénom valide.' })
  @MinLength(2, { message: 'Veuillez renseigner un prénom d\'au moins 2 caractères.' })
  @MaxLength(50, { message: 'Votre prénom est un peu trop long (maximum 50 caractères).' })
  @Matches(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*$/, { message: 'Veuillez n\'utiliser que des lettres, espaces ou tirets pour votre prénom, et il ne peut pas commencer par un espace.' })
  name!: string;

  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner un nom valide.' })
  @MinLength(2, { message: 'Veuillez renseigner un nom d\'au moins 2 caractères.' })
  @MaxLength(50, { message: 'Votre nom est un peu trop long (maximum 50 caractères).' })
  @Matches(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*$/, { message: 'Veuillez n\'utiliser que des lettres, espaces ou tirets pour votre nom, et il ne peut pas commencer par un espace.' })
  lastname!: string;

  @IsNotEmpty({ message: 'L\'adresse e-mail est obligatoire.' })
  @IsEmail({}, { message: 'Veuillez renseigner une adresse e-mail valide (ex: champion@2round.fr).' })
  @MaxLength(255, { message: 'Votre adresse e-mail est trop longue.' })
  email!: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Veuillez renseigner un mot de passe.' })
  @MinLength(8, { message: 'Pour votre sécurité, veuillez choisir un mot de passe d\'au moins 8 caractères.' })
  @MaxLength(100, { message: 'Votre mot de passe est trop long.' })
  @Matches(/(?=.*[A-Z])/, { message: 'Veuillez inclure au moins une majuscule dans votre mot de passe.' })
  @Matches(/(?=.*[0-9])/, { message: 'Veuillez inclure au moins un chiffre dans votre mot de passe.' })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, { message: 'Veuillez inclure au moins un caractère spécial dans votre mot de passe (ex: ! @ # ?).' })
  password!: string;

  @IsOptional()
  @IsNumber({}, { message: 'Veuillez renseigner un nombre pour votre poids.' })
  @Min(20, { message: 'Le poids renseigné semble incorrect (minimum 20 kg).' })
  @Max(250, { message: 'Le poids renseigné semble incorrect (maximum 250 kg).' })
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Veuillez renseigner un nombre pour votre taille.' })
  @Min(100, { message: 'La taille renseignée semble incorrecte (minimum 100 cm).' })
  @Max(250, { message: 'La taille renseignée semble incorrecte (maximum 250 cm).' })
  height?: number;

  @IsOptional()
  @IsString({ message: 'Veuillez sélectionner un style de boxe valide.' })
  @IsIn(['Anglaise', 'Thaï', 'Française', 'Kickboxing', 'MMA', 'Autre'], { message: 'Le style de boxe que vous avez sélectionné n\'est pas reconnu.' })
  boxingType?: string;
}