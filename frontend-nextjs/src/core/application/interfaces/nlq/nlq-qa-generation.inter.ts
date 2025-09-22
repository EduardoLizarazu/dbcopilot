import { TCreateNlqQaGenerationPromptTemplate } from "../../dtos/nlq/nlq-qa-generation.dto";

export interface INlqQaGenerationRepository {
  queryGeneration(prompt: string): Promise<string>;
  createPromptTemplateToGenerateQuery(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<string>;
  extractQueryFromPrompt(prompt: string): Promise<string>;
}
