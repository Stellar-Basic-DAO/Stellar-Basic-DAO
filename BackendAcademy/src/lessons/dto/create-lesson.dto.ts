import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, MaxLength } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @MaxLength(128)
  courseId: string;

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(65536)
  content: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  xpReward?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
