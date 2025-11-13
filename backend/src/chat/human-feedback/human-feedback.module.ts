import { Module } from '@nestjs/common';
import { HumanFeedbackService } from './human-feedback.service';
import { HumanFeedbackController } from './human-feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanFeedback } from './entities/human-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HumanFeedback])],
  controllers: [HumanFeedbackController],
  providers: [HumanFeedbackService],
})
export class HumanFeedbackModule {}
