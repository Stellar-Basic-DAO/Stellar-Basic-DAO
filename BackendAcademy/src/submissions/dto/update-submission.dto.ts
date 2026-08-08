import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { SubmissionStatus } from '../interfaces/submission-status.enum';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(65536)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileUrl?: string;

  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(16384)
  feedback?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  reviewedBy?: string;
}
