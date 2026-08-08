import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8192)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  proposer: string;
}

export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  vote: 'yes' | 'no';
}
