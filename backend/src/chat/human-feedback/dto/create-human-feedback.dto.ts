import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateHumanFeedbackDto {
  @ApiProperty()
  @IsBoolean()
  isLike: boolean;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNumber()
  promptId: number;
}
