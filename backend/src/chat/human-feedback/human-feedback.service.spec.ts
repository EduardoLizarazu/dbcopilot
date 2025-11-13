import { Test, TestingModule } from '@nestjs/testing';
import { HumanFeedbackService } from './human-feedback.service';

describe('HumanFeedbackService', () => {
  let service: HumanFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HumanFeedbackService],
    }).compile();

    service = module.get<HumanFeedbackService>(HumanFeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
