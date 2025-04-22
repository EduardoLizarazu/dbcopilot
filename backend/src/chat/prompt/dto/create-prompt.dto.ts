import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePromptDto {
  @ApiProperty()
  @IsNumber()
  connectionId: number;

  @ApiProperty()
  @IsString()
  prompt: string;
}
