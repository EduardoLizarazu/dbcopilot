import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

/**
 * Step to delete a NLQ QA good item by its ID:
 * 1. Validates the provided ID.
 * 2. Attempts to delete the item from the repository.
 * 3. If deletion is successful, returns void; otherwise, throws an error.
 */

export interface IDeleteNlqQaGoodStep {
  run(id: string): Promise<void>;
}

export class DeleteNlqQaGoodStep implements IDeleteNlqQaGoodStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}

  async run(id: string): Promise<void> {
    try {
      if (!id) {
        this.logger.error("Invalid ID provided for deletion.");
        throw new Error("Invalid ID provided.");
      }

      await this.nlqQaGoodRepo.delete(id);
      this.logger.info(`Deleted NLQ QA Good item with ID: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete NLQ QA Good item with ID: ${id}`,
        error.message
      );
      throw new Error("Failed to delete NLQ QA Good item." + error.message);
    }
  }
}
