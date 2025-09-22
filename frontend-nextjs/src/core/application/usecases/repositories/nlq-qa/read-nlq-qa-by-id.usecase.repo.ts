import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { IReadNlqQaByIdAppUseCase } from "../../interfaces/nlq-qa/read-nlq-qa-by-id.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";

export class ReadNlqQaByIdUseCase implements IReadNlqQaByIdAppUseCase {
  constructor(
    private nlqQaRepository: INlqQaRepository,
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      this.logger.info(`Reading NLQ QA with id: ${id}`);
      const nlqQa = await this.nlqQaRepository.findById(id);
      if (!nlqQa) {
        this.logger.warn(`NLQ QA with id ${id} not found`);
        return { success: false, message: "NLQ QA not found", data: null };
      }
      this.logger.info(`NLQ QA found: ${JSON.stringify(nlqQa)}`);
      return { success: true, message: "NLQ QA found", data: nlqQa };
    } catch (error) {
      this.logger.error("Error reading NLQ QA by id", { error });
      return { success: false, message: "Error reading NLQ QA", data: null };
    }
  }
}
