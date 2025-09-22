import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationUseCase } from "../../interfaces/nlq-qa-generation/nlq-qa-query-generation.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { INlqQaGenerationRepository } from "@/core/application/interfaces/nlq/nlq-qa-generation.inter";

export class NlqQaQueryGenerationUseCase
  implements INlqQaQueryGenerationUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenerationRepository: INlqQaGenerationRepository
  ) {}
  async execute(prompt: string): Promise<TResponseDto<{ answer: string }>> {
    try {
      this.logger.info(
        `[NlqQaQueryGenerationUseCase] Executing with prompt: ${prompt}`
      );
      const answer =
        await this.nlqQaQueryGenerationRepository.queryGeneration(prompt);
      this.logger.info(
        `[NlqQaQueryGenerationUseCase] Generated answer: ${answer}`
      );
      return {
        success: true,
        message: "NLQ QA query generated successfully",
        data: answer,
      };
    } catch (error) {
      this.logger.error(`[NlqQaQueryGenerationUseCase] Error: ${error}`);
      return {
        success: false,
        message: "Error generating NLQ QA query",
        data: null,
      };
    }
  }
}
