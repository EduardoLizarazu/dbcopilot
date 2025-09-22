import { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaCreatePromptTemplateGenerationUseCase {
  execute(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<TResponseDto<{ promptTemplate: string }>>;
}
