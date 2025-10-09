import { ReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { ExtractSchemaBasedStep } from "@/core/application/steps/infoBased/extract-schemabased.step";
import { SearchSimilarQuestionOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/search-similar-question-on-knowledge-base.step";
import { ValidateInputOnCreateNlqQaStep } from "@/core/application/steps/nlq-qa/validate-create-nlq-qa-input-data.step";
import { CreatePromptTemplateToGenQueryStep } from "@/core/application/steps/genQuery/create-prompt-template-to-gen-query.step";
import { GenQueryFromPromptTemplateStep } from "@/core/application/steps/genQuery/gen-query-from-prompt-template.step";
import { ExtractQueryFromGenQueryStep } from "@/core/application/steps/genQuery/extract-query-from-gen-query.step";
import { ExtractSuggestionFromPromptTemplateStep } from "@/core/application/steps/genQuery/extract-suggestion-from-prompt-template.step";
import { PolicySafeUnMutableQueryStep } from "@/core/application/steps/genQuery/policy-safe-unmutable-query.step";
import { ExecuteQueryStep } from "@/core/application/steps/infoBased/execute-query.step";
import { CreateNlqQaStep } from "@/core/application/steps/nlq-qa/create-nlq-qa.step";
import { CreateNlqQaErrorStep } from "@/core/application/steps/nlq-qa-error/create-nlq-qa-error.step";
import { CreateNlqQaUseCase } from "@/core/application/usecases/nlq/nlq-qa/create-nlq-qa.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaController } from "@/http/controllers/nlq-qa/create-nlq-qa.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-generation.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaErrorRepository } from "@/infrastructure/repository/nlq/nlq-qa-error.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function createNlqQaComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();
  const oracleProvider = new OracleProvider();
  const typeOrmProvider = new TypeOrmProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const nlqQaKnowledgeAdapter = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openAiProvider
  );
  const nlqQaInformationAdapter = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider,
    typeOrmProvider
  );
  const nlqQaGenerationAdapter = new NlqQaGenerationAdapter(
    loggerProvider,
    openAiProvider
  );
  const nlqQaErrorRepository = new NlqQaErrorRepository(
    loggerProvider,
    firebaseAdmin
  );

  const connRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // STEPS
  const validateInputStep = new ValidateInputOnCreateNlqQaStep(loggerProvider);
  const extractDbConnWithSplitterAndSchemaQueryStep =
    new ReadDbConnectionWithSplitterAndSchemaQueryStep(
      loggerProvider,
      connRepo
    );

  const searchSimilarQuestionOnKnowledgeBaseStep =
    new SearchSimilarQuestionOnKnowledgeBaseStep(
      loggerProvider,
      nlqQaKnowledgeAdapter
    );

  const extractSchemaBasedStep = new ExtractSchemaBasedStep(
    loggerProvider,
    nlqQaInformationAdapter
  );

  const createPromptToGenQueryStep = new CreatePromptTemplateToGenQueryStep(
    loggerProvider,
    nlqQaGenerationAdapter
  );

  const genQueryFromPromptTemplateStep = new GenQueryFromPromptTemplateStep(
    loggerProvider,
    nlqQaGenerationAdapter
  );

  const extractQueryFromGenQueryStep = new ExtractQueryFromGenQueryStep(
    loggerProvider,
    nlqQaGenerationAdapter
  );

  const extractSuggestionFromGenQueryStep =
    new ExtractSuggestionFromPromptTemplateStep(
      loggerProvider,
      nlqQaGenerationAdapter
    );

  const safePolicyUnMutationQueryStep = new PolicySafeUnMutableQueryStep(
    loggerProvider,
    nlqQaGenerationAdapter
  );

  const executeQueryStep = new ExecuteQueryStep(
    loggerProvider,
    nlqQaInformationAdapter
  );

  const createNlqQaStep = new CreateNlqQaStep(loggerProvider, nlqQaRepository);

  const createNlqQaErrorStep = new CreateNlqQaErrorStep(
    loggerProvider,
    nlqQaErrorRepository
  );

  // Use cases
  const createNlqQaUseCase = new CreateNlqQaUseCase(
    loggerProvider,
    validateInputStep,
    extractDbConnWithSplitterAndSchemaQueryStep,
    searchSimilarQuestionOnKnowledgeBaseStep,
    extractSchemaBasedStep,
    createPromptToGenQueryStep,
    genQueryFromPromptTemplateStep,
    extractQueryFromGenQueryStep,
    extractSuggestionFromGenQueryStep,
    safePolicyUnMutationQueryStep,
    executeQueryStep,
    createNlqQaStep,
    createNlqQaErrorStep
  );

  // Controllers
  const controller: IController = new CreateNlqQaController(
    loggerProvider,
    createNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
