import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";

export interface IGenQueryFromPromptTemplateStep {
  run(data: { promptTemplate: string }): Promise<{ answer: string }>;
}

export class GenQueryFromPromptTemplateStep
  implements IGenQueryFromPromptTemplateStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationPort: INlqQaQueryGenerationPort
  ) {}

  async run(data: {
    promptTemplate: string;
  }): Promise<{ answer: string }> {
    try {
      this.logger.info(
        `[GenQueryFromPromptTemplateStep] Generating query from prompt template: ${data.promptTemplate}`
      );

      if (!data.promptTemplate) {
        this.logger.error(
          `[GenQueryFromPromptTemplateStep] Prompt template is required`
        );
        throw new Error("Prompt template is required");
      }

      const query = await this.nlqQaGenerationPort.queryGeneration(
        data.promptTemplate
      );

      this.logger.info(
        `[GenQueryFromPromptTemplateStep] Generated query: ${query}`
      );

      if (!query || !query.answer) {
        this.logger.error(
          `[GenQueryFromPromptTemplateStep] Failed to generate query`
        );
        throw new Error("Failed to generate query");
      }

      return { answer: query.answer };
    } catch (error) {
      this.logger.error(
        `[GenQueryFromPromptTemplateStep] Error: ${error.message}`
      );
      throw new Error(
        "Error in GenQueryFromPromptTemplateStep " + error.message
      );
    }
  }
}
