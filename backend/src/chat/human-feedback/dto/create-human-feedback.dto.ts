import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHumanFeedbackDto {
  @ApiProperty()
  @IsBoolean()
  isLike: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty()
  @IsNumber()
  promptId: number;
}
