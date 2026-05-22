import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
 
export class CreateTypeReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label!: string;
}
 