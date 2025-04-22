import { Test, TestingModule } from '@nestjs/testing';
import { HumanFeedbackController } from './human-feedback.controller';
import { HumanFeedbackService } from './human-feedback.service';

describe('HumanFeedbackController', () => {
  let controller: HumanFeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HumanFeedbackController],
      providers: [HumanFeedbackService],
    }).compile();

    controller = module.get<HumanFeedbackController>(HumanFeedbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
