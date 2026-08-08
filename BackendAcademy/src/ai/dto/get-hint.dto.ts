import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class GetHintDto {
  @IsString()
  @MaxLength(128)
  challengeId: string;

  @IsString()
  @MaxLength(128)
  userId: string;

  @IsOptional()
  @IsNumber()
  difficulty?: number;
}
