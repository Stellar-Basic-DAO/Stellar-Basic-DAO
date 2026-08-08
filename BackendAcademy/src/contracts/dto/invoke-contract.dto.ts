import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class InvokeContractDto {
  @IsString()
  @MaxLength(128)
  contractId: string;

  @IsString()
  @MaxLength(128)
  method: string;

  @IsArray()
  @IsString({ each: true })
  args: string[];

  @IsString()
  @MaxLength(64)
  sourceAccount: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;
}

export class DeployContractDto {
  @IsString()
  @MaxLength(128)
  contractId: string;

  @IsString()
  @MaxLength(72)
  wasmHash: string;

  @IsString()
  @MaxLength(128)
  deployedBy: string;

  @IsString()
  @MaxLength(32)
  network: string;
}
