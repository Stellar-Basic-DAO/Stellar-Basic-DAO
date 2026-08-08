import { IsString, IsNumber, IsOptional, IsArray, IsEnum, MaxLength, Min } from 'class-validator';
import { TaskDifficulty } from '../interfaces/task-difficulty.enum';

export class CreateTaskDto {
  @IsString()
  @MaxLength(128)
  lessonId: string;

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(8192)
  description: string;

  @IsEnum(TaskDifficulty)
  difficulty: TaskDifficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testCases?: string[];

  @IsString()
  @MaxLength(16384)
  expectedOutput: string;

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
}
