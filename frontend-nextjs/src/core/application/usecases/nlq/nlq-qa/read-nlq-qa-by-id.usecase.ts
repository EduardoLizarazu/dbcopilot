import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IReadNlqQaByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class ReadNlqQaByIdUseCase implements IReadNlqQaByIdUseCase {
  constructor(
    private nlqQaRepository: INlqQaRepository,
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(`[ReadNlqQaByIdUseCase] Invalid id: ${id}`);
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }

      this.logger.info(`Reading NLQ QA with id: ${id}`);

      // 2. Fetch NLQ QA entry by ID
      const nlqQa = await this.nlqQaRepository.findById(id);
      if (!nlqQa) {
        this.logger.warn(`NLQ QA with id ${id} not found`);
        return { success: false, message: "NLQ QA not found", data: null };
      }

      this.logger.info(`NLQ QA found: ${JSON.stringify(nlqQa)}`);

      // 3. Return success response
      return { success: true, message: "NLQ QA found", data: nlqQa };
    } catch (error) {
      this.logger.error("Error reading NLQ QA by id", { error });
      return { success: false, message: "Error reading NLQ QA", data: null };
    }
  }
}
