import {
  createNlqQaGenerationPromptTemplate,
  TCreateNlqQaGenerationPromptTemplate,
} from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";

export interface ICreatePromptTemplateToGenQueryStep {
  run(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<{ promptTemplate: string }>;
}

export class CreatePromptTemplateToGenQueryStep
  implements ICreatePromptTemplateToGenQueryStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationPort: INlqQaQueryGenerationPort
  ) {}

  async run(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<{ promptTemplate: string }> {
    try {
      this.logger.info(
        `[CreatePromptTemplateToGenQueryStep] Creating prompt template with data: ${JSON.stringify(data)}`
      );
      //   1. Validate input data
      const validData =
        await createNlqQaGenerationPromptTemplate.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[CreatePromptTemplateToGenQueryStep] Invalid input data: ${JSON.stringify(validData.error.issues)}`
        );
        throw new Error("Invalid input data");
      }

      //   2. Create prompt template
      const prompt =
        await this.nlqQaGenerationPort.createPromptTemplateToGenerateQuery(
          validData.data
        );
      this.logger.info(
        `[CreatePromptTemplateToGenQueryStep] Created prompt template characters: ${prompt.promptTemplate.length}`
      );

      if (!prompt.promptTemplate) {
        this.logger.error(
          `[CreatePromptTemplateToGenQueryStep] Failed to create prompt template`
        );
        throw new Error("Failed to create prompt template");
      }

      //   3. Return prompt template
      return prompt;

      return prompt;
    } catch (error) {
      this.logger.error(
        `[CreatePromptTemplateToGenQueryStep] Error: ${error.message}`
      );
      throw new Error(
        "Error in CreatePromptTemplateToGenQueryStep " + error.message
      );
    }
  }
}
