import {
  nlqQaInRequestSchema,
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { IDbConnectionRepository } from "@/core/application/interfaces/dbconnection.inter";

/**
 * Create NLQ QA Use Case:
 * 1. Validate input data
 * 2. Extract db connection with "vbd_splitter" and "schema_query"
 * 3. Search similar questions from knowledge base with "vbd_splitter"
 * 4. Extract schema based on database with "schema_query"
 * 5. Create prompt template to generate SQL query
 * 6. Generate SQL query from prompt template
 * 6.a Extract SQL query
 * 6.a.1 Validate SQL query
 * 6.b Extract suggestions
 * 7.a Execute query
 * 7.b Error handling of query execution
 * 8. Create NLQ QA entry
 * 9. Return response
 */

export interface ICreateNlqQaUseCase {
  execute(data: TNlqQaInRequestDto): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class CreateNlqQaUseCase implements ICreateNlqQaUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepository: INlqQaRepository,
    private readonly nlqQaKnowledgePort: INlqQaKnowledgePort,
    private readonly dbConnRepo: IDbConnectionRepository,
    private readonly nlqQaInformationPort: INlqQaInformationPort,
    private readonly nlqQaGenerationPort: INlqQaQueryGenerationPort,
    private readonly nlqQaErrorRepository: INlqQaErrorRepository
  ) {}

  async execute(
    data: TNlqQaInRequestDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      this.logger.info("[CreateNlqQaUseCase]: Creating NLQ QA...", {
        data,
      });

      // 1. Validate input data
      const nlqQaValidationAsync =
        await nlqQaInRequestSchema.safeParseAsync(data);
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

      // 2. Extract db connection with "vbd_splitter" and "schema_query"
      const dbConn = await this.dbConnRepo.findWithVbdAndUserById(
        data.dbConnectionId
      );
      if (!dbConn) {
        this.logger.error(
          `[CreateNlqQaUseCase]: DB Connection not found or VBD Splitter not configured: ${data.dbConnectionId}`
        );
        return {
          data: null,
          success: false,
          message: "DB Connection not found or VBD Splitter not configured",
        };
      }

      if (!dbConn.schema_query || dbConn.schema_query.trim() === "") {
        this.logger.error(
          `[CreateNlqQaUseCase]: DB Connection schema_query is empty: ${data.dbConnectionId}`
        );
        return {
          data: null,
          success: false,
          message: "DB Connection schema_query is empty",
        };
      }

      if (!dbConn.vbd_splitter || !dbConn.vbd_splitter.name) {
        this.logger.error(
          `[CreateNlqQaUseCase]: DB Connection VBD Splitter is not configured: ${data.dbConnectionId}`
        );
        return {
          data: null,
          success: false,
          message: "DB Connection VBD Splitter is not configured",
        };
      }

      // 3. Search similar questions from knowledge base with "vbd_splitter"
      const similarQuestions = await this.nlqQaKnowledgePort.findByQuestion({
        namespace: dbConn.vbd_splitter.name,
        question: data.question,
      });
      this.logger.info(
        `[CreateNlqQaUseCase]: Found ${similarQuestions.length} similar questions`
      );
      const similarQuestionsId = similarQuestions.map((q) => q.id);

      // 4. Extract schema based on database with "schema_query"
      const schema =
        await this.nlqQaInformationPort.extractSchemaFromConnection({
          type: dbConn.type,
          host: dbConn.host,
          port: dbConn.port,
          database: dbConn.database,
          username: dbConn.username,
          password: dbConn.password,
          sid: dbConn.sid,
          schema_query: dbConn.schema_query,
        });
      this.logger.info(
        `[CreateNlqQaUseCase]: Extracted schema with ${schema.length} tables`
      );

      // 5. Create prompt template to generate SQL query
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

      // 6. Generate SQL query from prompt template
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

      // 6.a Extract SQL query
      const query =
        await this.nlqQaGenerationPort.extractQueryFromGenerationResponse(
          answer.answer
        );
      this.logger.info(
        `[CreateNlqQaUseCase]: Extracted SQL query: ${query.query}`
      );
      //  6.a.1 Validate SQL query
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

          const nlqErrorId = await this.nlqQaErrorRepository.create({
            question: data.question,
            errorMessage: "Generated SQL query is not safe",
            query: query.query,
            knowledgeSourceUsedId: similarQuestionsId,
            createdBy: data.createdBy,
            createdAt: new Date(),
          });

          this.logger.info(
            `[CreateNlqQaUseCase]: Created NLQ QA Error with id: ${nlqErrorId}`
          );

          await this.nlqQaRepository.create({
            question: data.question,
            query: query.query,
            isGood: false,
            timeQuestion: new Date(),
            timeQuery: new Date(),
            knowledgeSourceUsedId: similarQuestionsId,
            userDeleted: false,
            feedbackId: "",
            nlqQaGoodId: "",
            dbConnectionId: data.dbConnectionId,
            nlqErrorId: nlqErrorId,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return {
            data: null,
            success: false,
            message: "Generated SQL query is not safe",
          };
        }
      }

      // 6.b Extract suggestions
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

      // 7.a Execute query
      let informationData = { data: [] };
      try {
        informationData = await this.nlqQaInformationPort.executeQuery(
          query.query
        );
        this.logger.info(
          `[CreateNlqQaUseCase]: Executed query, received data: ${informationData.data ? informationData.data.length : 0} rows`
        );
      } catch (error) {
        this.logger.error(
          `[CreateNlqQaUseCase]: Error executing query: ${query.query}`,
          { error: error instanceof Error ? error.message : String(error) }
        );
        //  7.b Error handling of query execution
        const nlqErrorId = await this.nlqQaErrorRepository.create({
          question: data.question,
          errorMessage: error instanceof Error ? error.message : String(error),
          query: query.query,
          knowledgeSourceUsedId: similarQuestionsId,
          createdBy: data.createdBy,
          createdAt: new Date(),
        });

        this.logger.info(
          `[CreateNlqQaUseCase]: Created NLQ QA Error with id: ${nlqErrorId}`
        );

        await this.nlqQaRepository.create({
          question: data.question,
          query: query.query,
          isGood: false,
          timeQuestion: new Date(),
          timeQuery: new Date(),
          knowledgeSourceUsedId: similarQuestionsId,
          dbConnectionId: data.dbConnectionId,
          userDeleted: false,
          feedbackId: "",
          nlqQaGoodId: "",
          nlqErrorId: nlqErrorId,
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          data: null,
          success: false,
          message: error instanceof Error ? error.message : String(error),
        };
      }

      // 8. Create NLQ QA entry
      const newNlqQaId = await this.nlqQaRepository.create({
        question: data.question,
        query: query.query,
        isGood: true,
        timeQuestion: new Date(),
        timeQuery: new Date(),
        knowledgeSourceUsedId: similarQuestionsId,
        dbConnectionId: data.dbConnectionId,
        userDeleted: false,
        feedbackId: "",
        nlqQaGoodId: "",
        nlqErrorId: "",
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
      // 9. Return response
      return {
        data: {
          ...newNlqQa,
          results: informationData.data || [],
        },
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
