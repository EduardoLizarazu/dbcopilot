import { TNlqQaGoodOutRequestDto } from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

/**
 * Steps to read NLQ QA Good entries by DB Connection ID:
 * 1. Validate input dbConnId
 * 2. Check if there are NLQ QA Good entries associated with the dbConnId
 * 3. Return the list of NLQ QA Good entries
 */

export interface IReadNlqQaGoodByDbConnIdStep {
  run(data: { dbConnId: string }): Promise<TNlqQaGoodOutRequestDto[]>;
}

export class ReadNlqQaGoodByDbConnIdStep
  implements IReadNlqQaGoodByDbConnIdStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}

  async run(data: { dbConnId: string }): Promise<TNlqQaGoodOutRequestDto[]> {
    try {
      this.logger.info(
        `[ReadNlqQaGoodByDbConnIdStep] Reading NLQ QA Good by DB Connection ID: ${data.dbConnId}`
      );
      //   1. Validate input dbConnId
      if (!data.dbConnId || data.dbConnId.trim() === "") {
        this.logger.warn(
          `[ReadNlqQaGoodByDbConnIdStep] No DB Connection ID provided`
        );
        throw new Error("No DB Connection ID provided");
      }

      //   2. Check if there are NLQ QA Good entries associated with the dbConnId
      const nlqQaGoods = await this.nlqQaGoodRepo.findByDbConnId(data.dbConnId);
      if (!nlqQaGoods || nlqQaGoods.length === 0) {
        this.logger.warn(
          `[ReadNlqQaGoodByDbConnIdStep] No NLQ QA Good entries found for DB Connection ID: ${data.dbConnId}`
        );
        return [];
      }

      //   3. Return the list of NLQ QA Good entries
      return nlqQaGoods;
    } catch (error) {
      this.logger.error(
        `[ReadNlqQaGoodByDbConnIdStep] Error reading NLQ QA Good by DB Connection ID: ${error.message}`
      );
      throw new Error(
        error.message || "Error reading NLQ QA Good by DB Connection ID"
      );
    }
  }
}
