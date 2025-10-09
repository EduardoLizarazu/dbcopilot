import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IExtractSuggestionFromPromptTemplateStep {
  run(data: { genResponse: string }): Promise<{ suggestion: string }>;
}

export class ExtractSuggestionFromPromptTemplateStep
  implements IExtractSuggestionFromPromptTemplateStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenPort: INlqQaQueryGenerationPort
  ) {}

  async run(data: {
    genResponse: string;
  }): Promise<{ suggestion: string | null }> {
    try {
      // 1. Validate input
      if (!data.genResponse || data.genResponse.trim() === "") {
        this.logger.error(
          `[ExtractSuggestionFromPromptTemplateStep] Invalid input: ${JSON.stringify(data)}`
        );
        return { suggestion: null };
      }

      // 2. Extract suggestion using the generation port

      const response =
        await this.nlqQaQueryGenPort.extractSuggestionsFromGenerationResponse(
          data.genResponse
        );
      this.logger.info(
        `[ExtractSuggestionFromPromptTemplateStep] Extracted suggestion: ${response?.suggestion}`
      );

      if (!response || !response.suggestion) {
        this.logger.error(
          `[ExtractSuggestionFromPromptTemplateStep] Failed to extract suggestion`
        );
        throw new Error("Failed to extract suggestion");
      }

      return { suggestion: response.suggestion };
    } catch (error) {
      this.logger.error(
        `[ExtractSuggestionFromPromptTemplateStep] Error: ${error.message}`
      );
      throw new Error(
        "Error extracting suggestion from generation response: " + error.message
      );
    }
  }
}
