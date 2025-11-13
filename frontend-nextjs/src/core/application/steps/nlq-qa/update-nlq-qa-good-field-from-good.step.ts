import {
  TNlqQaOutRequestDto,
  TUpdateNlqGoodDto,
  updateNlqGoodSchema,
} from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IUpdateNlqQaGoodFieldFromGoodStep {
  run(data: TUpdateNlqGoodDto): Promise<TNlqQaOutRequestDto>;
}

export class UpdateNlqQaGoodFieldFromGoodStep
  implements IUpdateNlqQaGoodFieldFromGoodStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}
  async run(data: TUpdateNlqGoodDto): Promise<TNlqQaOutRequestDto> {
    try {
      this.logger.info(
        `[UpdateNlqQaGoodFieldFromGoodStep] Updating good field for ID: ${data.id}`
      );

      // 1. Validate input
      const validData = await updateNlqGoodSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[UpdateNlqQaGoodFieldFromGoodStep] Invalid input data: ${data}`
        );
        throw new Error("Invalid input data");
      }

      // 2. Update the isGood field using the NLQ QA repository
      await this.nlqQaRepo.update(data.id, validData.data);
      this.logger.info(
        `[UpdateNlqQaGoodFieldFromGoodStep] Successfully updated isGood field for ID: ${data.id}`
      );

      // 3. Retrieve the updated NLQ QA entry

      const updatedEntry = await this.nlqQaRepo.findById(validData.data.id);
      if (!updatedEntry) {
        this.logger.error(
          `[UpdateNlqQaGoodFieldFromGoodStep] NLQ QA entry not found for ID: ${data.id}`
        );
        throw new Error("NLQ QA entry not found");
      }
      return updatedEntry;
    } catch (error) {
      this.logger.error(
        `[UpdateNlqQaGoodFieldFromGoodStep] Error updating isGood field for ID: ${data.id} - ${error.message}`
      );
      throw new Error("Error updating isGood field: " + error.message);
    }
  }
}
