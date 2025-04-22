import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PromptModule } from './prompt/prompt.module';
import { SqlqueryModule } from './sqlquery/sqlquery.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [PromptModule, SqlqueryModule],
})
export class ChatModule {}
