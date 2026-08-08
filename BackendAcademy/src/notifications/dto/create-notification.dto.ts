import { IsString, IsIn, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(128)
  userId: string;

  @IsIn(['push', 'in-app'])
  type: 'push' | 'in-app';

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(4096)
  message: string;
}
