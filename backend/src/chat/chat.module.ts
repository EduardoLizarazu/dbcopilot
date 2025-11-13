import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PromptModule } from './prompt/prompt.module';
import { SqlqueryModule } from './sqlquery/sqlquery.module';
import { HumanFeedbackModule } from './human-feedback/human-feedback.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [PromptModule, SqlqueryModule, HumanFeedbackModule],
})
export class ChatModule {}
