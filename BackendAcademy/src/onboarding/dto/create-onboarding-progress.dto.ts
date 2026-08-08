import { IsString, IsNumber, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateOnboardingProgressDto {
  @IsString()
  @MaxLength(128)
  userId: string;

  @IsString()
  @MaxLength(128)
  currentStep: string;

  @IsNumber()
  totalSteps: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
