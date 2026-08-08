import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

/**
 * Request body for POST /auth/session/login.
 *
 * In production this would validate credentials against a user store.
 * Here we accept a userId + role pair so the service can be wired in
 * without a full database dependency.
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(256)
  password: string;
}
