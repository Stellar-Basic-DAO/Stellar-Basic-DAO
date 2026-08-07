import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { TutorSpecialty } from '../interfaces/tutor-specialty.enum';

export class CreateTutorProfileDto {
  @IsString()
  @MaxLength(64)
  userId: string;

  @IsString()
  @MaxLength(4096)
  bio: string;

  @IsArray()
  @IsEnum(TutorSpecialty, { each: true })
  specialties: TutorSpecialty[];

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
