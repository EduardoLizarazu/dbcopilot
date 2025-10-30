import { TNlqQaHistoryOutDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IReadNlqQaByIdStep {
  run(id: string): Promise<TNlqQaHistoryOutDto | null>;
}

export class ReadNlqQaByIdStep implements IReadNlqQaByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}
  async run(id: string): Promise<TNlqQaHistoryOutDto> {
    try {
      this.logger.info("[ReadNlqQaByIdStep] Reading NLQ QA by ID:", id);
      // 1. Validate
      if (!id) {
        throw new Error("NLQ QA ID is required");
      }

      // 2. Read from repository
      const nlqQa = await this.nlqQaRepo.findById(id);

      if (!nlqQa) {
        this.logger.info("[ReadNlqQaByIdStep] NLQ QA not found for ID:", id);
        throw new Error("NLQ QA not found");
      }

      this.logger.info("[ReadNlqQaByIdStep] NLQ QA found:", nlqQa);

      return nlqQa;
    } catch (error) {
      this.logger.error(
        "[ReadNlqQaByIdStep] Error reading NLQ QA by ID:",
        error.message
      );
      throw new Error(error.message || "Error reading NLQ QA by ID");
    }
  }
}
