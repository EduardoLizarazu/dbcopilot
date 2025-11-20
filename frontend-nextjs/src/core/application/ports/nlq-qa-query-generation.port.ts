import { TCreateNlqQaGenerationPromptTemplate } from "../dtos/nlq/nlq-qa-generation.dto";
import { TSchemaCtxSchemaDto } from "../dtos/schemaCtx.dto";

export interface INlqQaQueryGenerationPort {
  queryGeneration(prompt: string): Promise<{ answer: string }>;
  createPromptTemplateToGenerateQuery(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<{ promptTemplate: string }>;
  extractQueryFromGenerationResponse(
    generationResponse: string
  ): Promise<{ query: string }>;
  safeQuery(query: string): Promise<{ query: string; isSafe: boolean }>;
  extractSuggestionsFromGenerationResponse(
    generationResponse: string
  ): Promise<{ suggestion: string }>;
  genNewQuestionAndQuery(data: {
    previousQuestion: string;
    previousQuery: string;
    schemaChange: {
      status: "DELETE" | "UPDATE";
      new: string; // delete schema in string format
      old: string;
    };
    schemaCtx: TSchemaCtxSchemaDto[]; // only if has change (update)
  }): Promise<{ question: string; query: string }>;
}
