import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Body used by an admin to verify a tutor profile.
 * Records who performed the verification and an optional note.
 */
export class VerifyTutorDto {
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
