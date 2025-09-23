import {
  createNlqQaSchema,
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { INlqQaGenerationPort } from "@/core/application/ports/nlq-qa-generation.port";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
export interface ICreateNlqQaAppUseCase {
  execute(data: TNlqQaInRequestDto): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class CreateNlqQaAppUseCase implements ICreateNlqQaAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepository: INlqQaRepository,
    private readonly nlqQaKnowledgePort: INlqQaKnowledgePort,
    private readonly nlqQaInformationPort: INlqQaInformationPort,
    private readonly nlqQaGenerationPort: INlqQaGenerationPort,
    private readonly nlqQaErrorRepository: INlqQaErrorRepository
  ) {}

  async execute(
    data: TNlqQaInRequestDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      this.logger.info("[CreateNlqQaUseCase]: Creating NLQ QA...", {
        data,
      });

      // ==== VALIDATE ====
      const nlqQaValidationAsync = await createNlqQaSchema.safeParseAsync(data);
      if (!nlqQaValidationAsync.success) {
        this.logger.error(
          "[CreateNlqQaUseCase]: Invalid data:",
          nlqQaValidationAsync.error.errors
        );
        return {
          data: null,
          success: false,
          message: "Invalid data",
        };
      }

      // ==== BUSINESS LOGIC USE CASES ====
      // 1. Search similar questions
      const similarQuestions = await this.nlqQaKnowledgePort.findByQuestion(
        data.question
      );
      this.logger.info(
        `[CreateNlqQaUseCase]: Found ${similarQuestions.length} similar questions`
      );
      const similarQuestionsId = similarQuestions.map((q) => q.id);

      // 2. Extract schema based on database
      const schema = await this.nlqQaInformationPort.extractSchemaBased([]);
      this.logger.info(
        `[CreateNlqQaUseCase]: Extracted schema with ${schema.length} tables`
      );

      // 3. Create prompt template
      const prompt =
        await this.nlqQaGenerationPort.createPromptTemplateToGenerateQuery({
          question: data.question,
          similarKnowledgeBased: similarQuestions,
          schemaBased: schema,
        });
      this.logger.info(
        `[CreateNlqQaUseCase]: Created prompt template: ${prompt.promptTemplate}`
      );
      if (!prompt.promptTemplate) {
        this.logger.error(`[CreateNlqQaUseCase]: Prompt template is empty`);
        return {
          data: null,
          success: false,
          message: "Prompt template is empty",
        };
      }

      // 5. Generate SQL query from prompt template
      const answer = await this.nlqQaGenerationPort.queryGeneration(
        prompt.promptTemplate
      );
      this.logger.info(
        `[CreateNlqQaUseCase]: Generated answer from prompt: ${answer.answer}`
      );
      if (!answer.answer) {
        this.logger.error(`[CreateNlqQaUseCase]: Answer is empty`);
        return {
          data: null,
          success: false,
          message: "Answer generation is empty",
        };
      }

      // 5.a Extract SQL query
      const query =
        await this.nlqQaGenerationPort.extractQueryFromGenerationResponse(
          answer.answer
        );
      this.logger.info(
        `[CreateNlqQaUseCase]: Extracted SQL query: ${query.query}`
      );
      // 5.a.1 Validate SQL query
      if (query.query) {
        const isSafeQuery = await this.nlqQaGenerationPort.safeQuery(
          query.query
        );
        if (!isSafeQuery || !query.query || query.query.trim() === "") {
          this.logger.error(
            `[CreateNlqQaUseCase]: SQL query is not safe: ${query.query}`
          );
          return {
            data: null,
            success: false,
            message: "Generated SQL query is not safe",
          };
        }
        if (!isSafeQuery.isSafe) {
          this.logger.error(
            `[CreateNlqQaUseCase]: SQL query is not safe: ${query.query}`
          );
          await this.nlqQaErrorRepository.create({
            question: data.question,
            errorMessage: "Generated SQL query is not safe",
            query: query.query,
            knowledgeSourceUsedId: similarQuestionsId,
            createdBy: data.createdBy,
            createdAt: new Date(),
          });
          return {
            data: null,
            success: false,
            message: "Generated SQL query is not safe",
          };
        }
      }

      // 5.b Extract suggestions
      let suggestion = null;
      if (!query.query) {
        this.logger.info(
          `[CreateNlqQaUseCase]: Found SQL query: ${query.query}`
        );
        suggestion =
          await this.nlqQaGenerationPort.extractSuggestionsFromGenerationResponse(
            answer.answer
          );
        this.logger.info(
          `[CreateNlqQaUseCase]: Extracted suggestion: ${suggestion.suggestion}`
        );
        if (!suggestion.suggestion) {
          this.logger.error(
            `[CreateNlqQaUseCase]: Suggestion is empty when query is empty`
          );
          return {
            data: null,
            success: false,
            message: "Suggestion is empty when query is empty",
          };
        }
        return {
          data: null,
          success: false,
          message: suggestion.suggestion,
        };
      }

      // 6.a Execute query
      try {
        const informationData = await this.nlqQaInformationPort.executeQuery(
          query.query
        );
        this.logger.info(
          `[CreateNlqQaUseCase]: Executed query, received data: ${informationData.data.length} rows`
        );
      } catch (error) {
        this.logger.error(
          `[CreateNlqQaUseCase]: Error executing query: ${query.query}`,
          { error }
        );
        // 6.b Error handling of query execution
        await this.nlqQaErrorRepository.create({
          question: data.question,
          errorMessage: error instanceof Error ? error.message : String(error),
          query: query.query,
          knowledgeSourceUsedId: similarQuestionsId,
          createdBy: data.createdBy,
          createdAt: new Date(),
        });
        return {
          data: null,
          success: false,
          message: error instanceof Error ? error.message : String(error),
        };
      }

      // 7. Create NLQ QA entry
      const newNlqQaId = await this.nlqQaRepository.create({
        question: data.question,
        query: query.query,
        isGood: true,
        timeQuestion: new Date(),
        timeQuery: new Date(),
        knowledgeSourceUsedId: similarQuestionsId,
        userDeleted: false,
        feedbackId: "",
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.logger.info("[CreateNlqQaUseCase]: Created NLQ QA", {
        newNlqQaId,
      });
      const newNlqQa = await this.nlqQaRepository.findById(newNlqQaId);

      this.logger.info("[CreateNlqQaUseCase]: Fetched NLQ QA", { newNlqQa });
      if (!newNlqQa) {
        this.logger.error(
          "[CreateNlqQaUseCase]: NLQ QA not found after create"
        );
        return {
          data: null,
          success: false,
          message: "NLQ QA not found after create",
        };
      }
      return {
        data: newNlqQa,
        success: true,
        message: "NLQ QA created successfully",
      };
    } catch (error) {
      this.logger.error("[CreateNlqQaUseCase]: Error creating NLQ QA", {
        error,
      });
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
