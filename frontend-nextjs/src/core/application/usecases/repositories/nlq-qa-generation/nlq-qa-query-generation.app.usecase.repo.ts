import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationUseCase } from "../../interfaces/nlq-qa-generation/nlq-qa-query-generation.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { INlqQaGenerationRepository } from "@/core/application/interfaces/nlq/nlq-qa-generation.inter";
import { IReadNlqQaKnowledgeByQuestionUseCase } from "../../interfaces/nlq-qa-knowledge/read-nlq-qa-knowledge-by-question.usecase.inter";
import { INlqQaInformationExtractSchemaBasedUseCase } from "../../interfaces/nlq-qa-information/nlq-qa-information-extract-schema-based.usecase.inter";
import { INlqQaCreatePromptTemplateGenerationUseCase } from "../../interfaces/nlq-qa-generation/nlq-qa-create-prompt-template-generation.app.usecase.inter";
import { INlqQaExtractQueryFromPromptAppUseCase } from "../../interfaces/nlq-qa-generation/nlq-qa-extract-query-from-prompt.app.usecase.inter";
import { INlqQaInformationExecuteQueryUseCase } from "../../interfaces/nlq-qa-information/nlq-qa-information-execute-query.usecase.inter";
import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export class NlqQaQueryGenerationUseCase
  implements INlqQaQueryGenerationUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenerationRepository: INlqQaGenerationRepository,
    private readonly readNlqQaKnowledgeByQuestionUseCase: IReadNlqQaKnowledgeByQuestionUseCase,
    private readonly readNlqQaInformationExtractSchemaBasedUseCase: INlqQaInformationExtractSchemaBasedUseCase,
    private readonly nlqQaCreatePromptTemplateGenerationUseCase: INlqQaCreatePromptTemplateGenerationUseCase,
    private readonly nlqQaExtractQueryFromPromptAppUseCase: INlqQaExtractQueryFromPromptAppUseCase,
    private readonly nlqQaInformationExecuteQueryUseCase: INlqQaInformationExecuteQueryUseCase
  ) {}
  async execute(question: string): Promise<TResponseDto<TNlqInformationData>> {
    try {
      // Validate the question
      if (!question || question.trim() === "") {
        this.logger.error("[NlqQaQueryGenerationUseCase] Invalid question");
        return {
          success: false,
          message: "Invalid question",
          data: null,
        };
      }
      // 1. Retrieve similar question from knowledge base
      const knowledgeResult =
        await this.readNlqQaKnowledgeByQuestionUseCase.execute(question);
      if (!knowledgeResult.success || !knowledgeResult.data) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] Error retrieving knowledge: ${knowledgeResult.message}`
        );
        return {
          success: false,
          message: "Error retrieving knowledge",
          data: null,
        };
      }

      // 2. Retrieve the schema from information base
      const schemaInformation =
        await this.readNlqQaInformationExtractSchemaBasedUseCase.execute([]);
      if (!schemaInformation.success || !schemaInformation.data) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] Error retrieving schema information: ${schemaInformation.message}`
        );
        return {
          success: false,
          message: "Error retrieving schema information",
          data: null,
        };
      }

      // 3. Generate the prompt template
      const prompt =
        await this.nlqQaCreatePromptTemplateGenerationUseCase.execute({
          question,
          similarKnowledgeBased: knowledgeResult.data,
          schemaBased: schemaInformation.data, // Cast to resolve type incompatibility
        });
      if (!prompt.success || !prompt.data) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] Error generating prompt template`
        );
        return {
          success: false,
          message: "Error generating prompt template",
          data: null,
        };
      }

      this.logger.info(
        `[NlqQaQueryGenerationUseCase] Generated prompt: ${prompt.data}`
      );

      // 4. Generate the query using LLM
      const generatedQuery =
        await this.nlqQaQueryGenerationRepository.queryGeneration(prompt.data);
      if (!generatedQuery) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] No query generated from LLM`
        );
        return {
          success: false,
          message: "No query generated from LLM",
          data: null,
        };
      }
      // 4. Retrieve the query from LLM
      const extractedQuery =
        await this.nlqQaExtractQueryFromPromptAppUseCase.execute(
          generatedQuery
        );
      if (!extractedQuery.success || !extractedQuery.data) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] No query extracted from LLM response`
        );
        return {
          success: false,
          message: "No query extracted from LLM response",
          data: null,
        };
      }

      // 5. Execute the query and return the result
      const queryResult =
        await this.nlqQaInformationExecuteQueryUseCase.execute(
          extractedQuery.data
        );
      if (!queryResult.success || !queryResult.data) {
        this.logger.error(
          `[NlqQaQueryGenerationUseCase] Error executing query: ${queryResult.message}`
        );
        return {
          success: false,
          message: "Error executing query",
          data: null,
        };
      }

      return {
        success: true,
        message: "NLQ QA query generated and executed successfully",
        data: queryResult.data,
      };
    } catch (error) {
      this.logger.error(`[NlqQaQueryGenerationUseCase] Error: ${error}`);
      return {
        success: false,
        message: "Error generating NLQ QA query",
        data: null,
      };
    }
  }
}
