import { IsString, IsNumber, IsOptional, IsArray, IsEnum, MaxLength, Min, IsBoolean } from 'class-validator';
import { TaskDifficulty } from '../interfaces/task-difficulty.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8192)
  description?: string;

  @IsOptional()
  @IsEnum(TaskDifficulty)
  difficulty?: TaskDifficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testCases?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(16384)
  expectedOutput?: string;

  @IsOptional()
  @IsNumber()
  xpReward?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(65536)
  templateCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
