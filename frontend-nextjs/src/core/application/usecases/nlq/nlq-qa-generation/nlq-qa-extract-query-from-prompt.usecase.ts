import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGenerationRepository } from "../../../interfaces/nlq/nlq-qa-generation.inter";

export interface INlqQaExtractQueryFromPromptAppUseCase {
  execute(prompt: string): Promise<TResponseDto<{ query: string }>>;
}

export class NlqQaExtractQueryFromPromptAppUseCase
  implements INlqQaExtractQueryFromPromptAppUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationRepository: INlqQaGenerationRepository
  ) {}

  async execute(prompt: string): Promise<TResponseDto<{ query: string }>> {
    try {
      this.logger.info(
        `[NlqQaExtractQueryFromPromptAppUseCase] Extracting query from prompt: ${prompt}`
      );
      const query =
        await this.nlqQaGenerationRepository.extractQueryFromGenerationResponse(
          prompt
        );
      if (!query) {
        this.logger.warn(
          `[NlqQaExtractQueryFromPromptAppUseCase] No query extracted from prompt`
        );
        return {
          success: false,
          message: "No query extracted from prompt",
          data: null,
        };
      }
      this.logger.info(
        `[NlqQaExtractQueryFromPromptAppUseCase] Query extracted: ${query}`
      );
      return {
        success: true,
        message: "Query extracted successfully",
        data: query,
      };
    } catch (error) {
      this.logger.error(
        `[NlqQaExtractQueryFromPromptAppUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error extracting query from prompt",
        data: null,
      };
    }
  }
}
