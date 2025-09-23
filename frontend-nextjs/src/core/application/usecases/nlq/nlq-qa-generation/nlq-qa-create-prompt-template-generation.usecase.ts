import { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGenerationRepository } from "../../../interfaces/nlq/nlq-qa-generation.inter";

export interface INlqQaCreatePromptTemplateGenerationUseCase {
  execute(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<TResponseDto<{ promptTemplate: string }>>;
}

export class NlqQaCreatePromptTemplateGenerationUseCase
  implements INlqQaCreatePromptTemplateGenerationUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGenerationRepository: INlqQaGenerationRepository
  ) {}
  async execute(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<TResponseDto<{ promptTemplate: string }>> {
    try {
      this.logger.info(
        `[NlqQaCreatePromptTemplateGenerationUseCase] Generating NLQ QA prompt template with data: ${JSON.stringify(data)}`
      );
      const promptTemplate =
        await this.nlqQaGenerationRepository.createPromptTemplateToGenerateQuery(
          data
        );
      //   Confirm string type
      if (typeof promptTemplate !== "string") {
        this.logger.error(
          `[NlqQaCreatePromptTemplateGenerationUseCase] Invalid prompt template type: ${typeof promptTemplate}`
        );
        return {
          success: false,
          message: "Invalid prompt template type",
          data: null,
        };
      }
      this.logger.info(
        `[NlqQaCreatePromptTemplateGenerationUseCase] Prompt template generated successfully: ${promptTemplate}`
      );
      return {
        success: true,
        message: "NLQ QA prompt template generated successfully",
        data: promptTemplate,
      };
    } catch (error) {
      this.logger.error(
        `[NlqQaCreatePromptTemplateGenerationUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error generating NLQ QA prompt template",
        data: null,
      };
    }
  }
}
