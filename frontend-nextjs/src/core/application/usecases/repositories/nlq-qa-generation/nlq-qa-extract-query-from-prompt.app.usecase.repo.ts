import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaExtractQueryFromPromptAppUseCase } from "../../interfaces/nlq-qa-generation/nlq-qa-extract-query-from-prompt.app.usecase.inter";
import { INlqQaGenerationRepository } from "@/core/application/interfaces/nlq/nlq-qa-generation.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export class NlqQaExtractQueryFromPromptAppUseCase
  implements INlqQaExtractQueryFromPromptAppUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationRepository: INlqQaGenerationRepository
  ) {}

  async execute(prompt: string): Promise<TResponseDto> {
    try {
      this.logger.info(
        `[NlqQaExtractQueryFromPromptAppUseCase] Extracting query from prompt: ${prompt}`
      );
      const query =
        await this.nlqQaGenerationRepository.extractQueryFromPrompt(prompt);
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
