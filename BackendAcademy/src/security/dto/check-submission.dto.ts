import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CheckSubmissionDto {
  @IsString()
  @MaxLength(64)
  learnerId: string;

  @IsString()
  @MaxLength(64)
  taskId: string;

  @IsString()
  @MaxLength(65536)
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
