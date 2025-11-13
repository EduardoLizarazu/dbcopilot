import {
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IValidateInputOnCreateNlqQaStep } from "@/core/application/steps/nlq-qa/validate-create-nlq-qa-input-data.step";
import { IExtractSchemaBasedStep } from "@/core/application/steps/infoBased/extract-schemabased.step";
import { ISearchSimilarQuestionOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/search-similar-question-on-knowledge-base.step";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { ICreatePromptTemplateToGenQueryStep } from "@/core/application/steps/genQuery/create-prompt-template-to-gen-query.step";
import { IGenQueryFromPromptTemplateStep } from "@/core/application/steps/genQuery/gen-query-from-prompt-template.step";
import { IExtractQueryFromGenQueryStep } from "@/core/application/steps/genQuery/extract-query-from-gen-query.step";
import { IExecuteQueryStep } from "@/core/application/steps/infoBased/execute-query.step";
import { ICreateNlqQaStep } from "@/core/application/steps/nlq-qa/create-nlq-qa.step";
import { ICreateNlqQaErrorStep } from "@/core/application/steps/nlq-qa-error/create-nlq-qa-error.step";
import { IExtractSuggestionFromPromptTemplateStep } from "@/core/application/steps/genQuery/extract-suggestion-from-prompt-template.step";
import { IPolicySafeUnMutableQueryStep } from "@/core/application/steps/genQuery/policy-safe-unmutable-query.step";
import {
  TNlqInfoExtractorDto,
  TNlqInformationData,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

/**
 * Create NLQ QA Use Case:
 * 1. Validate input data
 * 2. Extract db connection with "vbd_splitter" and "schema_query"
 * 3. Search similar questions from knowledge base with "vbd_splitter"
 * 4. Extract schema based on database with "schema_query"
 * 5. Create prompt template to generate SQL query
 * 6. Generate SQL query from prompt template
 * 6.a Extract SQL query
 * 6.a.1 If SQL query is null, extract suggestion from generation response and return with suggestion
 * 6.a.2 If suggestion is null, return error
 * 6.a.3 If query is not null, validate SQL Query policy (no mutation)
 * 6.a.4 If not safe, save on nlq_qa_error and reference nlq qa and return with error
 * 7.a Execute query
 * 7.b Error handling of query execution, save on nlq_qa_error and reference nlq qa and return with error
 * 8. Create NLQ QA entry
 * 9. Return response with information
 */

export interface ICreateNlqQaUseCase {
  execute(data: TNlqQaInRequestDto): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class CreateNlqQaUseCase implements ICreateNlqQaUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validInput: IValidateInputOnCreateNlqQaStep,
    private readonly extractDbConnWithSplitterAndSchemaQueryStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly searchSimilarQuestionOnKnowledgeBaseStep: ISearchSimilarQuestionOnKnowledgeBaseStep,
    private readonly extractSchemaBasedStep: IExtractSchemaBasedStep,
    private readonly createPromptToGenQueryStep: ICreatePromptTemplateToGenQueryStep,
    private readonly genQueryFromPromptTemplateStep: IGenQueryFromPromptTemplateStep,
    private readonly extractQueryFromGenQueryStep: IExtractQueryFromGenQueryStep,
    private readonly extractSuggestionFromGenQueryStep: IExtractSuggestionFromPromptTemplateStep,
    private readonly safePolicyUnMutationQueryStep: IPolicySafeUnMutableQueryStep,
    private readonly executeQueryStep: IExecuteQueryStep,
    private readonly createNlqQaStep: ICreateNlqQaStep,
    private readonly createNlqQaErrorStep: ICreateNlqQaErrorStep
  ) {}

  async execute(
    data: TNlqQaInRequestDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      this.logger.info(
        "[CreateNlqQaUseCase]: Starting NLQ QA creation process"
      );

      // 1. Validate input data
      const dateValidate = await this.validInput.run(data);

      // 2. Extract db connection with "vbd_splitter" and "schema_query"
      const dbConnWithSplitterAndSchemaQuery =
        await this.extractDbConnWithSplitterAndSchemaQueryStep.run({
          dbConnectionId: data.dbConnectionId,
        });

      // 3. Search similar questions from knowledge base with "vbd_splitter"
      const similarQuestionFromKnowledgeBase =
        await this.searchSimilarQuestionOnKnowledgeBaseStep.run({
          question: data.question,
          splitterName:
            dbConnWithSplitterAndSchemaQuery?.vbd_splitter?.name || "",
        });

      // 4. Extract schema based on database with "schema_query"
      const schemaBased = await this.extractSchemaBasedStep.run({
        type: dbConnWithSplitterAndSchemaQuery?.type,
        host: dbConnWithSplitterAndSchemaQuery?.host,
        port: dbConnWithSplitterAndSchemaQuery?.port,
        database: dbConnWithSplitterAndSchemaQuery?.database,
        username: dbConnWithSplitterAndSchemaQuery?.username,
        password: dbConnWithSplitterAndSchemaQuery?.password,
        sid: dbConnWithSplitterAndSchemaQuery?.sid,
        schema_query: dbConnWithSplitterAndSchemaQuery?.schema_query || "",
      });

      // 5. Create prompt template to generate SQL query
      const promptTemplateToGenQuery =
        await this.createPromptToGenQueryStep.run({
          question: data.question,
          schemaBased: schemaBased,
          similarKnowledgeBased: similarQuestionFromKnowledgeBase,
          dbType: dbConnWithSplitterAndSchemaQuery?.type || "ANSI SQL",
        });

      // 6. Generate SQL query from prompt template
      const genQueryFromPromptTemplate =
        await this.genQueryFromPromptTemplateStep.run({
          promptTemplate: promptTemplateToGenQuery.promptTemplate,
        });

      // 6.a Extract SQL query
      const extractQueryFromGenQuery =
        await this.extractQueryFromGenQueryStep.run({
          unCleanQuery: genQueryFromPromptTemplate.answer,
        });

      // 6.a.1 If SQL query is null, extract suggestion from generation response and return with suggestion
      if (!extractQueryFromGenQuery?.query) {
        const suggestion = await this.extractSuggestionFromGenQueryStep.run({
          genResponse: genQueryFromPromptTemplate.answer,
        });
        return {
          data: null,
          success: false,
          message: `Failed to generate SQL query. Suggestion: ${suggestion.suggestion}`,
        };
      }

      // 6.a.3 If query is not null, validate SQL Query policy (no mutation)
      const safePolicyUnMutationQuery =
        await this.safePolicyUnMutationQueryStep.run({
          query: extractQueryFromGenQuery.query,
        });

      // 6.a.4 If not safe, save on nlq_qa_error and reference nlq qa and return with error
      if (!safePolicyUnMutationQuery.isSafe) {
        const error = await this.createNlqQaErrorStep.run({
          question: data.question,
          query: extractQueryFromGenQuery.query,
          knowledgeSourceUsedId: similarQuestionFromKnowledgeBase.map(
            (q) => q.id
          ),
          errorMessage: "Generated query is not policy safe.",
          createdBy: dateValidate.actorId,
        });

        await this.createNlqQaStep.run({
          question: data.question,
          query: extractQueryFromGenQuery.query,
          isGood: false,
          nlqErrorId: error.id,
          knowledgeSourceUsedId: similarQuestionFromKnowledgeBase.map(
            (q) => q.id
          ),
          dbConnectionId: data.dbConnectionId,
          createdBy: dateValidate.actorId,
          updatedBy: dateValidate.actorId,
        });

        return {
          data: null,
          success: false,
          message: `Generated query is not policy safe.`,
        };
      }

      // 7.a Execute query
      let queryResult: TNlqInformationData | null = null;
      try {
        const executeQueryDto: TNlqInfoExtractorDto = {
          type: dbConnWithSplitterAndSchemaQuery?.type,
          host: dbConnWithSplitterAndSchemaQuery?.host || "",
          port: dbConnWithSplitterAndSchemaQuery?.port || 0,
          database: dbConnWithSplitterAndSchemaQuery?.database || "",
          username: dbConnWithSplitterAndSchemaQuery?.username || "",
          password: dbConnWithSplitterAndSchemaQuery?.password || "",
          sid: dbConnWithSplitterAndSchemaQuery?.sid || undefined,
          query: extractQueryFromGenQuery.query,
        };
        queryResult = await this.executeQueryStep.run(executeQueryDto);
      } catch (error) {
        // 7.b Error handling of query execution, save on nlq_qa_error and reference nlq qa and return with error
        const errorEntry = await this.createNlqQaErrorStep.run({
          question: data.question,
          query: extractQueryFromGenQuery.query,
          knowledgeSourceUsedId: similarQuestionFromKnowledgeBase.map(
            (q) => q.id
          ),
          errorMessage: error instanceof Error ? error.message : String(error),
          createdBy: dateValidate.actorId,
        });
        await this.createNlqQaStep.run({
          question: data.question,
          query: extractQueryFromGenQuery.query,
          isGood: false,
          nlqErrorId: errorEntry.id,
          knowledgeSourceUsedId: similarQuestionFromKnowledgeBase.map(
            (q) => q.id
          ),
          dbConnectionId: data.dbConnectionId,
          createdBy: dateValidate.actorId,
          updatedBy: dateValidate.actorId,
        });
        return {
          data: null,
          success: false,
          message: error instanceof Error ? error.message : String(error),
        };
      }

      // 8. Create NLQ QA entry
      const createdNlqQa = await this.createNlqQaStep.run({
        question: data.question,
        query: extractQueryFromGenQuery.query,
        isGood: true,
        nlqErrorId: "",
        knowledgeSourceUsedId: similarQuestionFromKnowledgeBase.map(
          (q) => q.id
        ),
        dbConnectionId: data.dbConnectionId,
        createdBy: dateValidate.actorId,
        updatedBy: dateValidate.actorId,
      });

      // 9. Return response with information

      this.logger.info(
        "[CreateNlqQaUseCase]: NLQ QA creation process completed successfully",
        JSON.stringify({
          data: createdNlqQa,
          queryResult: queryResult,
        })
      );

      return {
        success: true,
        message: "NLQ QA created successfully",
        data: {
          ...createdNlqQa,
          results: queryResult?.data || [],
        },
      };
    } catch (error) {
      this.logger.error("[CreateNlqQaUseCase]: Error creating NLQ QA", {
        error: error.message,
      });
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
