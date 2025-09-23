import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";

export interface IUpdateNlqQaGoodUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaGoodDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

export class UpdateNlqQaGoodUseCase implements IUpdateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}
  async execute(
    id: string,
    data: TUpdateNlqQaGoodDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Updating NLQ QA Good with ID: ${id}`,
        data
      );
      await this.nlqQaGoodRepository.update(id, data);

      const updatedNlqQaGood = await this.nlqQaGoodRepository.findById(id);
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Successfully updated NLQ QA Good with ID: ${id}`,
        updatedNlqQaGood
      );
      if (!updatedNlqQaGood) {
        return {
          data: null,
          message: "NLQ QA Good not found after update",
          success: false,
        };
      }

      return {
        data: updatedNlqQaGood,
        message: "NLQ QA Good updated successfully",
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateNlqQaGoodUseCase] Failed to update NLQ QA Good with ID: ${id}`,
        error
      );
      throw new Error("Failed to update NLQ QA Good");
    }
  }
}
