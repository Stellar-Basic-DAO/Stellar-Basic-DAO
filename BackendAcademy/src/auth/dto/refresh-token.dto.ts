import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Request body for POST /auth/session/refresh.
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  refreshToken: string;
}
