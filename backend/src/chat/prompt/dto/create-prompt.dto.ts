import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePromptDto {
  @ApiProperty()
  @IsString()
  prompt: string;
}
