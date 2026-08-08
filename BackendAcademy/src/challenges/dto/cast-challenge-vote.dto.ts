import { IsString, IsIn, MaxLength } from 'class-validator';

export class CastChallengeVoteDto {
  @IsString()
  @MaxLength(128)
  userId: string;

  @IsIn(['up', 'down'])
  value: 'up' | 'down';
}
