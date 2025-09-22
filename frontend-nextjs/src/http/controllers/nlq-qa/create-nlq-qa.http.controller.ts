import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IController } from "../IController.http.controller";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IReadNlqQaKnowledgeByQuestionUseCase } from "@/core/application/usecases/interfaces/nlq-qa-knowledge/read-nlq-qa-knowledge-by-question.usecase.inter";
import { INlqQaInformationExtractSchemaBasedUseCase } from "@/core/application/usecases/interfaces/nlq-qa-information/nlq-qa-information-extract-schema-based.usecase.inter";
import { INlqQaCreatePromptTemplateGenerationUseCase } from "@/core/application/usecases/interfaces/nlq-qa-generation/nlq-qa-create-prompt-template-generation.app.usecase.inter";
import { INlqQaQueryGenerationUseCase } from "@/core/application/usecases/interfaces/nlq-qa-generation/nlq-qa-query-generation.app.usecase.inter";
import { INlqQaExtractQueryFromPromptAppUseCase } from "@/core/application/usecases/interfaces/nlq-qa-generation/nlq-qa-extract-query-from-prompt.app.usecase.inter";
import { INlqQaExtractSuggestionFromPromptAppUseCase } from "@/core/application/usecases/interfaces/nlq-qa-generation/nlq-qa-extract-suggestion-from-prompt.app.usecase.inter";
import { INlqQaInformationExecuteQueryUseCase } from "@/core/application/usecases/interfaces/nlq-qa-information/nlq-qa-information-execute-query.usecase.inter";
import { ICreateNlqQaErrorUseCase } from "@/core/application/usecases/interfaces/nlq-qa-error/create-nlq-qa-error.usecasee.inter";
import { ICreateNlqQaAppUseCase } from "@/core/application/usecases/interfaces/nlq-qa/create-nlq-qa.usecase.inter";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";

export class CreateNlqQaController implements IController {
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
    private readonly createNlqQaUseCase: ICreateNlqQaAppUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====

      this.logger.info("[CreateNlqQaController] handling request", httpRequest);
      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[CreateNlqQaController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[CreateNlqQaController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[CreateNlqQaController] Token:", token);

      //   3. Decode token
      //   4. Retrieve roles
      //   5. Check roles permissions

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info("[CreateNlqQaController] Body:", httpRequest.body);
      if (!httpRequest.body) {
        this.logger.error("[CreateNlqQaController] No body provided");
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body as {
        question: string;
      };

      //   2. Check required params
      const bodyParams = Object.keys(body);
      const requiredParams = ["question"];
      for (const param of requiredParams) {
        if (!bodyParams.includes(param)) {
          this.logger.error(`[CreateNlqQaController] Missing param: ${param}`);
          const error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }
      }
      this.logger.info("[CreateNlqQaController] Body params:", bodyParams);

      // ==== BUSINESS LOGIC USE CASES ====
      // 1. Search similar questions
      const similarQuestions =
        await this.readNlqQaKnowledgeByQuestionUseCase.execute(body.question);
      this.logger.info(
        "[CreateNlqQaController] Similar questions found:",
        similarQuestions
      );
      if (!similarQuestions.success) {
        this.logger.error(
          "[CreateNlqQaController] No similar questions found",
          similarQuestions
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      // 2. Extract schema based on database
      const schemaExtraction =
        await this.nlqQaInformationExtractSchemaBasedUseCase.execute([]);
      this.logger.info(
        "[CreateNlqQaController] Schema extraction:",
        schemaExtraction
      );
      if (!schemaExtraction.success || schemaExtraction.data?.length === 0) {
        this.logger.error(
          "[CreateNlqQaController] No schema extraction",
          schemaExtraction
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      // 3. Create prompt template
      const promptTemplate =
        await this.nlqQaCreatePromptTemplateGenerationUseCase.execute({
          question: body.question,
          similarKnowledgeBased: similarQuestions.data || [],
          schemaBased: schemaExtraction.data || [],
        });
      this.logger.info(
        "[CreateNlqQaController] Prompt template:",
        promptTemplate
      );

      if (
        !promptTemplate.success ||
        !promptTemplate.data ||
        !promptTemplate.data.promptTemplate
      ) {
        this.logger.error(
          "[CreateNlqQaController] No prompt template generated",
          promptTemplate
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      // 5. Generate SQL query from prompt template
      const responseGenerated = await this.nlqQaQueryGenerationUseCase.execute(
        promptTemplate.data.promptTemplate
      );
      this.logger.info(
        "[CreateNlqQaController] SQL query generated:",
        responseGenerated
      );

      if (
        !responseGenerated.success ||
        !responseGenerated.data ||
        !responseGenerated.data.answer
      ) {
        this.logger.error(
          "[CreateNlqQaController] No SQL query generated",
          responseGenerated
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      // 5.a Extract SQL query
      const sqlQuery = await this.nlqQaExtractQueryFromPromptAppUseCase.execute(
        responseGenerated.data.answer
      );

      // 5.b Extract suggestions
      let suggestions = null;
      if (!sqlQuery.success || !sqlQuery.data) {
        this.logger.warn(
          "[CreateNlqQaController] No SQL query generated",
          sqlQuery
        );
        // continue with extract suggestion
        suggestions =
          await this.nlqQaExtractSuggestionFromPromptAppUseCase.execute(
            responseGenerated.data.answer
          );
        this.logger.info(
          "[CreateNlqQaController] Suggestions extracted:",
          suggestions
        );

        if (
          !suggestions.success ||
          !suggestions.data ||
          !suggestions.data.suggestion
        ) {
          this.logger.error(
            "[CreateNlqQaController] No suggestions extracted",
            suggestions
          );
          const error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }

        return new HttpResponse(200, {
          success: true,
          message: "Suggestions extracted successfully",
          data: suggestions.data.suggestion,
        });
      }

      // 6.a Execute query
      const queryResult =
        await this.nlqQaInformationExecuteQueryUseCase.execute(
          sqlQuery.data.query
        );
      this.logger.info(
        "[CreateNlqQaController] Query result:",
        queryResult.data
      );

      let errorResponse = null;
      if (!queryResult.success) {
        this.logger.error(
          "[CreateNlqQaController] Query execution failed",
          queryResult
        );
        // 6.b Error handling of query execution
        errorResponse = await this.createNlqQaErrorUseCase.execute({
          question: body.question,
          query: sqlQuery.data.query,
          errorMessage: queryResult.message,
          createdBy: "system", // to be replaced with actual user
          createdAt: new Date(),
        });
        this.logger.info(
          "[CreateNlqQaController] NLQ QA Error created:",
          errorResponse
        );
        if (
          !errorResponse.success ||
          !errorResponse.data ||
          errorResponse.data.length === 0
        ) {
          this.logger.error(
            "[CreateNlqQaController] NLQ QA Error creation failed",
            errorResponse
          );
          const error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }
      }

      // 7. Create NLQ QA entry
      const createNlqQa = await this.createNlqQaUseCase.execute({
        question: body.question,
        query: sqlQuery.data.query,
        isGood: true,
        timeQuestion: new Date(),
        timeQuery: new Date(),
        knowledgeSourceUsedId: similarQuestions.data?.map((sq) => sq.id) || [],
        userDeleted: false,
        errorId: errorResponse?.data || "",
        feedbackId: "", // always empty when creating
        userId: "system",
        createdBy: "system",
        createdAt: new Date(),
        updatedBy: "system",
        updatedAt: new Date(),
      });
      this.logger.info("[CreateNlqQaController] NLQ QA created:", createNlqQa);

      if (!createNlqQa.success || !createNlqQa.data) {
        this.logger.error(
          "[CreateNlqQaController] NLQ QA creation failed",
          createNlqQa
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: "NLQ QA created successfully",
        data: createNlqQa.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("[CreateNlqQaController] Unexpected error", err);
      const error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
