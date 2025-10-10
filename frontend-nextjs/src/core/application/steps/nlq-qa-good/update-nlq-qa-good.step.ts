import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
  updateNlqQaGoodSchema,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface IUpdateNlqQaGoodStep {
  run(data: TUpdateNlqQaGoodDto): Promise<TNlqQaGoodOutRequestDto>;
}

export class UpdateNlqQaGoodStep implements IUpdateNlqQaGoodStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}
  async run(data: TUpdateNlqQaGoodDto): Promise<TNlqQaGoodOutRequestDto> {
    try {
      this.logger.info(
        `[UpdateNlqQaGoodStep] Updating NLQ QA Good with data: ${JSON.stringify(
          data
        )}`
      );

      //   1. Update NLQ QA Good
      const validData = await updateNlqQaGoodSchema.safeParseAsync({
        ...data,
        updatedAt: new Date(),
      });

      if (!validData.success) {
        this.logger.error(
          `[UpdateNlqQaGoodStep] Invalid data: ${JSON.stringify(
            validData.error.issues
          )}`
        );
        throw new Error("Invalid data");
      }
      await this.nlqQaGoodRepository.update(data.id, validData.data);

      const updatedNlqQaGood = await this.nlqQaGoodRepository.findById(data.id);
      if (!updatedNlqQaGood) {
        this.logger.error(
          `[UpdateNlqQaGoodStep] NLQ QA Good with ID: ${data.id} not found after update`
        );
        throw new Error("NLQ QA Good not found after update");
      }

      this.logger.info(
        `[UpdateNlqQaGoodStep] Successfully updated NLQ QA Good with ID: ${data.id}`,
        updatedNlqQaGood
      );

      return updatedNlqQaGood;
    } catch (error) {
      this.logger.error(
        `[UpdateNlqQaGoodStep] Failed to update NLQ QA Good: ${error.message}`
      );
      throw new Error(`Failed to update NLQ QA Good: ${error.message}`);
    }
  }
}
