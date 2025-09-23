import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGenerationRepository } from "../../../interfaces/nlq/nlq-qa-generation.inter";

export interface INlqQaQueryGenerationUseCase {
  execute(question: string): Promise<TResponseDto<{ answer: string }>>;
}

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
