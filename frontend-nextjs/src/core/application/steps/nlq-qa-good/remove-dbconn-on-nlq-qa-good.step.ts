import { TNlqQaGoodOutRequestDto } from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

/**
 * Step to remove DB connection from NLQ QA Good by id:
 * 1. Validate input id
 * 2. Check if the NLQ QA Good entry exists
 * 3. Update the NLQ QA Good entry to set:
 *  - dbConnectionId to empty string
 *  - isOnKnowledgeSource to false
 *  - knowledgeSourceId to empty string
 * 4. Read the updated NLQ QA Good entry and return it
 * @param data - Object containing the id of the NLQ QA Good entry to update
 * @returns Promise<TNlqQaGoodOutRequestDto> - The updated NLQ QA Good entry
 * @throws Error if the NLQ QA Good entry does not exist or update fails
 */

export interface IRemoveDbConnOnNlqQaGoodByIdStep {
  run(data: { nlqQaGoodId: string }): Promise<TNlqQaGoodOutRequestDto>;
}

export class RemoveDbConnOnNlqQaGoodByIdStep
  implements IRemoveDbConnOnNlqQaGoodByIdStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}
  async run(data: { nlqQaGoodId: string }): Promise<TNlqQaGoodOutRequestDto> {
    try {
      this.logger.info(
        `[RemoveDbConnOnNlqQaGoodByIdStep] Removing DB connection from NLQ QA Good with id: ${data.nlqQaGoodId}`
      );

      // 1. Validate input id
      if (!data.nlqQaGoodId) {
        this.logger.error(`[RemoveDbConnOnNlqQaGoodByIdStep] Invalid input`);
        throw new Error("Invalid input");
      }
      // 2. Check if the NLQ QA Good entry exists
      const existingNlqQaGood = await this.nlqQaGoodRepo.findById(
        data.nlqQaGoodId
      );
      if (!existingNlqQaGood) {
        this.logger.error(
          `[RemoveDbConnOnNlqQaGoodByIdStep] NLQ QA Good with id ${data.nlqQaGoodId} does not exist`
        );
        throw new Error("NLQ QA Good entry does not exist");
      }

      // 3. Update the NLQ QA Good entry to set:
      await this.nlqQaGoodRepo.update(data.nlqQaGoodId, {
        id: data.nlqQaGoodId,
        dbConnectionId: "",
        isOnKnowledgeSource: false,
        knowledgeSourceId: "",
      });

      // 4. Read the updated NLQ QA Good entry and return it
      const updatedNlqQaGood = await this.nlqQaGoodRepo.findById(
        data.nlqQaGoodId
      );
      if (!updatedNlqQaGood) {
        this.logger.error(
          `[RemoveDbConnOnNlqQaGoodByIdStep] NLQ QA Good with id ${data.nlqQaGoodId} does not exist`
        );
        throw new Error("NLQ QA Good entry does not exist");
      }
      return updatedNlqQaGood;
    } catch (error) {
      this.logger.error(
        `[RemoveDbConnOnNlqQaGoodByIdStep] Error removing DB connection from NLQ QA Good with id ${data.nlqQaGoodId}: ${error.message}`
      );
      throw new Error(
        error.message || "Error removing DB connection from NLQ QA Good"
      );
    }
  }
}
