import { TNlqQaGoodOutRequestDto } from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

/**
 * Step to read a NLQ QA good item by its ID:
 * 1. Validates the provided ID.
 * 2. Fetches the item from the repository.
 * 3. If found, returns the item; otherwise, throws an error.
 */

export interface IReadNlqQaGoodByIdStep {
  run(id: string): Promise<TNlqQaGoodOutRequestDto>;
}

export class ReadNlqQaGoodByIdStep implements IReadNlqQaGoodByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}
  async run(id: string): Promise<TNlqQaGoodOutRequestDto> {
    try {
      this.logger.info(`Reading QA good item with ID: ${id}`);
      const item = await this.nlqQaGoodRepository.findById(id);
      if (!item) {
        this.logger.warn(`QA good item not found: ${id}`);
        throw new Error("QA good item not found");
      }
      return item;
    } catch (error) {
      this.logger.error(`Error reading QA good item: ${error.message}`);
      throw new Error("Failed to read QA good item.");
    }
  }
}
