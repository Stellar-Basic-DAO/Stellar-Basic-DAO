import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for saving or updating a submission draft.
 *
 * All content fields are optional so partial progress can be persisted
 * without requiring a fully formed submission.
 */
export class SaveDraftDto {
  @IsString()
  @MaxLength(128)
  taskId: string;

  @IsString()
  @MaxLength(128)
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(65536)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileUrl?: string;
}
