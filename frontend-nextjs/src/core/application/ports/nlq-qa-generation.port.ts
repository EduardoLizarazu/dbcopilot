import { TCreateNlqQaGenerationPromptTemplate } from "../dtos/nlq/nlq-qa-generation.dto";

export interface INlqQaGenerationPort {
  queryGeneration(prompt: string): Promise<{ answer: string }>;
  createPromptTemplateToGenerateQuery(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<{ promptTemplate: string }>;
  extractQueryFromGenerationResponse(
    generationResponse: string
  ): Promise<{ query: string }>;
  extractSuggestionsFromGenerationResponse(
    generationResponse: string
  ): Promise<{ suggestion: string }>;
}
