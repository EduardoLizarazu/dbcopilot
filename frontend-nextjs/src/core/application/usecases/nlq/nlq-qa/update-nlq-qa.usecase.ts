import {
  TNlqQaOutRequestDto,
  TUpdateNlqQaDto,
  updateNlqQaSchema,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IUpdateNlqQaUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class UpdateNlqQaUseCase implements IUpdateNlqQaUseCase {
  constructor(
    private logger: ILogger,
    private nlqQaRepository: INlqQaRepository
  ) {}

  async execute(
    id: string,
    data: TUpdateNlqQaDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(`[UpdateNlqQaUseCase] Invalid id: ${id}`);
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }
      const dataValidate = await updateNlqQaSchema.safeParseAsync(data);
      if (!dataValidate.success) {
        this.logger.error(
          `[UpdateNlqQaUseCase] Invalid data: ${JSON.stringify(
            dataValidate.error.issues
          )}`
        );
        return {
          success: false,
          message: "Invalid data",
          data: null,
        };
      }

      this.logger.info(`Updating NLQ QA with id: ${id}`);

      // 2. Check if NLQ QA entry exists
      const existingNlqQa = await this.nlqQaRepository.findById(id);
      if (!existingNlqQa) {
        this.logger.error(`[UpdateNlqQaUseCase] NLQ QA not found: ${id}`);
        return {
          success: false,
          message: "NLQ QA not found",
          data: null,
        };
      }

      // 3. Update NLQ QA entry
      await this.nlqQaRepository.update(id, data);

      // 4. Fetch updated NLQ QA entry
      const updatedNlqQa = await this.nlqQaRepository.findById(id);
      if (!updatedNlqQa) {
        this.logger.warn(`NLQ QA with id ${id} not found after update`);
        return { success: false, message: "NLQ QA not found", data: null };
      }
      this.logger.info(`NLQ QA updated: ${JSON.stringify(updatedNlqQa)}`);

      // 5. Return success response
      return {
        success: true,
        message: "NLQ QA updated successfully",
        data: updatedNlqQa,
      };
    } catch (error) {
      this.logger.error("Error updating NLQ QA", { error });
      return { success: false, message: "Error updating NLQ QA", data: null };
    }
  }
}
