import { TNlqQaErrorOutRequestDto } from "../../dtos/nlq/nlq-qa-error.app.dto";
import {
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "../../dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ICreateNlqQaErrorUseCase } from "../../usecases/nlq/nlq-qa-error/create-nlq-qa-error.usecase";
import { INlqQaCreatePromptTemplateGenerationUseCase } from "../../usecases/nlq/nlq-qa-generation/nlq-qa-create-prompt-template-generation.usecase";
import { INlqQaExtractQueryFromPromptAppUseCase } from "../../usecases/nlq/nlq-qa-generation/nlq-qa-extract-query-from-prompt.usecase";
import { INlqQaExtractSuggestionFromPromptAppUseCase } from "../../usecases/nlq/nlq-qa-generation/nlq-qa-extract-suggestion-from-prompt.usecase";
import { INlqQaQueryGenerationUseCase } from "../../usecases/nlq/nlq-qa-generation/nlq-qa-query-generation.usecase";
import { INlqQaInformationExecuteQueryUseCase } from "../../usecases/nlq/nlq-qa-information/nlq-qa-information-execute-query.usecase.inter";
import { INlqQaInformationExtractSchemaBasedUseCase } from "../../usecases/nlq/nlq-qa-information/nlq-qa-information-extract-schema-based.usecase.inter";
import { IReadNlqQaKnowledgeByQuestionUseCase } from "../../usecases/nlq/nlq-qa-knowledge/read-nlq-qa-knowledge-by-question.usecase";
import { ICreateNlqQaAppUseCase } from "../../usecases/nlq/nlq-qa/create-nlq-qa.usecase";

export interface ICreateNlqQaOrchestrator {
  run(
    data: TNlqQaInRequestDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto | TNlqQaErrorOutRequestDto>>;
}

export class CreateNlqQaOrchestrator implements ICreateNlqQaOrchestrator {
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaKnowledgeByQuestionUseCase: IReadNlqQaKnowledgeByQuestionUseCase,
    private readonly nlqQaInformationExtractSchemaBasedUseCase: INlqQaInformationExtractSchemaBasedUseCase,
    private readonly nlqQaCreatePromptTemplateGenerationUseCase: INlqQaCreatePromptTemplateGenerationUseCase,
    private readonly nlqQaQueryGenerationUseCase: INlqQaQueryGenerationUseCase,
    private readonly nlqQaExtractQueryFromPromptAppUseCase: INlqQaExtractQueryFromPromptAppUseCase,
    private readonly nlqQaExtractSuggestionFromPromptAppUseCase: INlqQaExtractSuggestionFromPromptAppUseCase,
    private readonly nlqQaInformationExecuteQueryUseCase: INlqQaInformationExecuteQueryUseCase,
    private readonly createNlqQaErrorUseCase: ICreateNlqQaErrorUseCase,
    private readonly createNlqQaUseCase: ICreateNlqQaAppUseCase
  ) {}

  async run(
    data: TNlqQaInRequestDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto | TNlqQaErrorOutRequestDto>> {
    try {
    } catch (error) {
      this.logger.error(
        `[CreateNlqQaOrchestrator] Error: ${(error as Error).message}`
      );
      return {
        success: false,
        message: "Error processing NLQ QA request",
        data: null,
      };
    }
  }
}
