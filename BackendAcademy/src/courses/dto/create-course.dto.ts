import { IsString, IsNumber, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';
import { CourseLevel } from '../interfaces/course-level.enum';

export class CreateCourseDto {
  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(8192)
  description: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsNumber()
  order: number;

  @IsString()
  @MaxLength(128)
  learningPathId: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsNumber()
  xpReward?: number;
}
