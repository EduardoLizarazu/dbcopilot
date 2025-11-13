import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodOnKnowledgeDto,
  updateNlqQaGoodOnKnowledgeSchema,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface IUpdateNlqQaGoodKnowledgeStep {
  run(data: TUpdateNlqQaGoodOnKnowledgeDto): Promise<TNlqQaGoodOutRequestDto>;
}

export class UpdateNlqQaGoodKnowledgeStep
  implements IUpdateNlqQaGoodKnowledgeStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}

  async run(
    data: TUpdateNlqQaGoodOnKnowledgeDto
  ): Promise<TNlqQaGoodOutRequestDto> {
    try {
      this.logger.info(
        "[UpdateNlqQaGoodKnowledgeStep] Updating NLQ QA Good knowledge:",
        data
      );

      // 1. Validate input
      const validData =
        await updateNlqQaGoodOnKnowledgeSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error("[UpdateNlqQaGoodKnowledgeStep] Invalid input:", {
          error: validData.error.errors,
        });
        throw new Error(
          "Invalid input: " + JSON.stringify(validData.error.issues)
        );
      }

      // 2. Ensure nlq QA Good entry exists
      const existingEntry = await this.nlqQaGoodRepo.findById(
        validData.data.id
      );
      if (!existingEntry) {
        this.logger.error(
          `[UpdateNlqQaGoodKnowledgeStep] NLQ QA Good entry not found with ID: ${validData.data.id}`
        );
        throw new Error("NLQ QA Good entry not found");
      }

      // 2. Update NLQ QA Good entry
      await this.nlqQaGoodRepo.update(validData.data.id, {
        ...validData.data,
      });

      // 3. Retrieve the updated entry
      const updatedNlqQaGood = await this.nlqQaGoodRepo.findById(
        validData.data.id
      );
      if (!updatedNlqQaGood) {
        this.logger.error(
          `[UpdateNlqQaGoodKnowledgeStep] Failed to retrieve updated NLQ QA Good with ID: ${validData.data.id}`
        );
        throw new Error("Failed to retrieve updated NLQ QA Good");
      }
      this.logger.info(
        "[UpdateNlqQaGoodKnowledgeStep] Updated NLQ QA Good knowledge:",
        updatedNlqQaGood
      );

      return updatedNlqQaGood;
    } catch (error) {
      this.logger.error(
        "[UpdateNlqQaGoodKnowledgeStep]: Error updating NLQ QA Good knowledge fields:",
        error.message
      );
      throw new Error(
        "Error updating NLQ QA Good knowledge fields: " + error.message
      );
    }
  }
}
