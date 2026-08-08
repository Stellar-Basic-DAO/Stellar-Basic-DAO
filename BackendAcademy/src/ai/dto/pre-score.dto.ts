import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class PreScoreDto {
  @IsString()
  @MaxLength(128)
  userId: string;

  @IsString()
  @MaxLength(128)
  taskId: string;

  @IsString()
  @MaxLength(65536)
  code: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
