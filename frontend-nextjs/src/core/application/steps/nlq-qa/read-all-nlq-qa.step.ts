import { ILogger } from "../../interfaces/ilog.app.inter";
import { TNlqQaHistoryOutDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface ReadAllNlqQaStep {
  run(): Promise<TNlqQaHistoryOutDto[]>;
}

export class ReadAllNlqQaStep implements ReadAllNlqQaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepository: INlqQaRepository
  ) {}

  async run(): Promise<TNlqQaHistoryOutDto[]> {
    try {
      const nlq = await this.nlqQaRepository.findAll();
      return nlq;
    } catch (error) {
      this.logger.error("Error in ReadAllNlqQaStep:", (error as any)?.message);
      throw new Error(
        (error as any)?.message || "Failed to read NLQ QA history."
      );
    }
  }
}
