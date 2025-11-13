import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';

@Module({
  imports: [],
  controllers: [PromptController],
  providers: [PromptService],
})
export class PromptModule {}
