import { IsOptional, IsDateString, IsString, MaxLength } from 'class-validator';

export class ListOfficeHoursDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  tutorId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
