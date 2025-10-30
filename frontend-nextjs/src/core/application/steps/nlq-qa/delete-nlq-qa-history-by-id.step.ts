import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IDeleteNlqQaHistoryByIdStep {
  run(data: { nlqId: string }): Promise<void>;
}

export class DeleteNlqQaHistoryByIdStep implements IDeleteNlqQaHistoryByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}
  async run(data: { nlqId: string }): Promise<void> {
    try {
      this.logger.info(
        `[DeleteNlqQaHistoryByIdStep] Deleting NLQ QA history by ID: `,
        JSON.stringify(data)
      );
      //   1. Validate input
      if (!data?.nlqId) {
        throw new Error("NLQ ID is required to delete history.");
      }
      //   2. Call repository to delete history
      await this.nlqQaRepo.delete(data.nlqId);

      //   3. Find all the nlq good entries associated with this originId
    } catch (error) {
      this.logger.error(
        `[DeleteNlqQaHistoryByIdStep] Error deleting NLQ QA history by ID: ${data.nlqId}`,
        error
      );
      throw new Error(
        error.message ||
          `Failed to delete NLQ QA history with ID: ${data.nlqId}`
      );
    }
  }
}
