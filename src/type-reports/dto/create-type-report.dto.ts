import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
 
export class CreateTypeReportDto {
  @IsNotEmpty({ message: 'Le libellé ne peut pas être vide.' })
  @IsString({ message: 'Le libellé est invalide.' })
  @MaxLength(100, { message: 'Le libellé ne peut pas dépasser 100 caractères.' })
  label!: string;
}