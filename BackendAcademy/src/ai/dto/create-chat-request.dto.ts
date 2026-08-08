import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateChatRequestDto {
  @IsString()
  @MaxLength(16384)
  message: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @IsString()
  @MaxLength(128)
  userId: string;
}
