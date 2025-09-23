import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGenerationRepository } from "../../../interfaces/nlq/nlq-qa-generation.inter";

export interface INlqQaExtractSuggestionFromPromptAppUseCase {
  execute(prompt: string): Promise<TResponseDto<{ suggestion: string }>>;
}

export class NlqQaExtractSuggestionFromPromptAppUseCase
  implements INlqQaExtractSuggestionFromPromptAppUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationRepository: INlqQaGenerationRepository
  ) {}

  async execute(prompt: string): Promise<TResponseDto<{ suggestion: string }>> {
    try {
      this.logger.info(
        `[NlqQaExtractSuggestionFromPromptAppUseCase] Extracting suggestion from prompt: ${prompt}`
      );
      const suggestion =
        await this.nlqQaGenerationRepository.extractSuggestionsFromGenerationResponse(
          prompt
        );
      //   Confirm string type
      if (typeof suggestion !== "string") {
        this.logger.error(
          `[NlqQaExtractSuggestionFromPromptAppUseCase] Invalid suggestion type: ${typeof suggestion}`
        );
        return {
          success: false,
          message: "Invalid suggestion type",
          data: null,
        };
      }
      this.logger.info(
        `[NlqQaExtractSuggestionFromPromptAppUseCase] Suggestion extracted successfully: ${suggestion}`
      );
      return {
        success: true,
        message: "Suggestion extracted successfully",
        data: { suggestion },
      };
    } catch (error) {
      this.logger.error(
        `[NlqQaExtractSuggestionFromPromptAppUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error extracting suggestion from prompt",
        data: null,
      };
    }
  }
}
