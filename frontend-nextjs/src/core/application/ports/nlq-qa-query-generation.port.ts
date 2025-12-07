import {
  TGenJudgePositiveFbDto,
  TGenJudgePositiveVbOutDto,
  TGenNewQuestionQueryFromOldDto,
  TGenQueryCorrectionDto,
} from "../dtos/gen-query.dto";
import { EnumDecision } from "../dtos/nlq/nlq-qa-feedback.app.dto";
import { TCreateNlqQaGenerationPromptTemplate } from "../dtos/nlq/nlq-qa-generation.dto";

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
  genNewQuestionAndQuery(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<{ question: string; query: string }>;
  genCorrectQuery(data: TGenQueryCorrectionDto): Promise<{ query: string }>;
}
