import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AiService],
  exports: [AiService],
  controllers: [],
  // Add any other modules or services that AiService depends on here
})
export class AiModule {}
