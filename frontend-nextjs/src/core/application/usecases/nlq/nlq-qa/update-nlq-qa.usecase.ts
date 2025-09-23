import {
  TNlqQaOutRequestDto,
  TUpdateNlqQaDto,
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
      this.logger.info(`Updating NLQ QA with id: ${id}`);
      await this.nlqQaRepository.update(id, data);
      const updatedNlqQa = await this.nlqQaRepository.findById(id);
      if (!updatedNlqQa) {
        this.logger.warn(`NLQ QA with id ${id} not found after update`);
        return { success: false, message: "NLQ QA not found", data: null };
      }
      this.logger.info(`NLQ QA updated: ${JSON.stringify(updatedNlqQa)}`);

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
