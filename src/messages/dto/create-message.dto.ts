import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'Le message ne peut pas être vide.' })
  @IsString({ message: 'Le message ne peut pas être vide.' })
  @MinLength(1, { message: 'Le message ne peut pas être vide.' })
  @MaxLength(1000, { message: 'Le message ne peut pas dépasser 1000 caractères.' })
  content!: string;
}