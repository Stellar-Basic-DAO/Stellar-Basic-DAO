import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @MaxLength(64)
  taskId: string;

  @IsString()
  @MaxLength(64)
  userId: string;

  @IsString()
  @MaxLength(65536)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileUrl?: string;
}
