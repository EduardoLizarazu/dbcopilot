import { TNlqQaHistoryOutDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface ReadAllNlqQaBaseOnUserStep {
  run(data: { userId: string }): Promise<TNlqQaHistoryOutDto[]>;
}

export class ReadAllNlqQaBaseOnUserStep implements ReadAllNlqQaBaseOnUserStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepository: INlqQaRepository
  ) {}

  async run(data: { userId: string }): Promise<TNlqQaHistoryOutDto[]> {
    try {
      this.logger.info(
        `[ReadAllNlqQaBaseOnUserStep] Reading NLQ QA history for userId: ${data.userId}`
      );
      // 1. Validate input data
      if (!data.userId || data.userId.trim().length === 0) {
        this.logger.error(
          `[ReadAllNlqQaBaseOnUserStep] Invalid userId provided: ${data.userId}`
        );
        throw new Error("Invalid userId provided");
      }

      //   2. Fetch NLQ QA history based on userId

      const nlq = await this.nlqQaRepository.findAllByUserId(data.userId);
      return nlq;
    } catch (error) {
      this.logger.error(
        "Error in ReadAllNlqQaBaseOnUserStep:",
        (error as any)?.message
      );
      throw new Error(
        (error as any)?.message ||
          "Failed to read NLQ QA history based on user."
      );
    }
  }
}
