import { CreateNlqQaErrorUseCase } from "@/core/application/usecases/repositories/nlq-qa-error/create-nlq-qa-error.usecase.repo";
import { NlqQaCreatePromptTemplateGenerationUseCase } from "@/core/application/usecases/repositories/nlq-qa-generation/nlq-qa-create-prompt-template-generation.app.usecase.repo";
import { NlqQaExtractQueryFromPromptAppUseCase } from "@/core/application/usecases/repositories/nlq-qa-generation/nlq-qa-extract-query-from-prompt.app.usecase.repo";
import { NlqQaExtractSuggestionFromPromptAppUseCase } from "@/core/application/usecases/repositories/nlq-qa-generation/nlq-qa-extract-suggestion-from-prompt.app.usecase.repo";
import { NlqQaQueryGenerationUseCase } from "@/core/application/usecases/repositories/nlq-qa-generation/nlq-qa-query-generation.app.usecase.repo";
import { NlqQaInformationExecuteQueryUseCase } from "@/core/application/usecases/repositories/nlq-qa-information/nlq-qa-information-execute-query.usecase.repo";
import { NlqQaInformationExtractSchemaBasedUseCase } from "@/core/application/usecases/repositories/nlq-qa-information/nlq-qa-information-extract-schema-based.usecase.repo";
import { ReadNlqQaKnowledgeByQuestionUseCase } from "@/core/application/usecases/repositories/nlq-qa-knowledge/read-nlq-qa-knowledge-by-question.app.usecase.repo";
import { CreateNlqQaAppUseCase } from "@/core/application/usecases/repositories/nlq-qa/create-nlq-qa.usecase.repo";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaController } from "@/http/controllers/nlq-qa/create-nlq-qa.http.controller";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { NlqQaErrorRepository } from "@/infrastructure/repository/nlq/nlq-qa-error.repo";
import { NlqQaGenerationInfraRepository } from "@/infrastructure/adapters/nlq-qa-generation.adapter";
import { NlqQaInformationInfraRepository } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { NlqQaKnowledgeAppRepository } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function createNlqQaComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();
  const oracleProvider = new OracleProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const nlqQaKnowledgeRepository = new NlqQaKnowledgeAppRepository(
    loggerProvider,
    pineconeProvider,
    openAiProvider
  );
  const nlqQaInformationRepository = new NlqQaInformationInfraRepository(
    loggerProvider,
    oracleProvider
  );
  const nlqQaGenerationRepository = new NlqQaGenerationInfraRepository(
    loggerProvider,
    openAiProvider
  );
  const nlqQaErrorRepository = new NlqQaErrorRepository(
    loggerProvider,
    firebaseAdmin
  );

  // Use cases
  // 1.  Similar Questions
  const readNlqQaKnowledgeByQuestionUseCase =
    new ReadNlqQaKnowledgeByQuestionUseCase(
      loggerProvider,
      nlqQaKnowledgeRepository
    );

  // 2. Extract Schema Based
  const nlqQaInformationExtractSchemaBasedUseCase =
    new NlqQaInformationExtractSchemaBasedUseCase(
      loggerProvider,
      nlqQaInformationRepository
    );
  // 3.  Build Prompt Template
  const nlqQaCreatePromptTemplateGenerationUseCase =
    new NlqQaCreatePromptTemplateGenerationUseCase(
      loggerProvider,
      nlqQaGenerationRepository
    );

  // 4. Generate Query
  const nlqQaQueryGenerationUseCase = new NlqQaQueryGenerationUseCase(
    loggerProvider,
    nlqQaGenerationRepository
  );

  // 5. Extract
  // 5.a Execute query
  const nlqQaExtractQueryFromPromptAppUseCase =
    new NlqQaExtractQueryFromPromptAppUseCase(
      loggerProvider,
      nlqQaGenerationRepository
    ); // part of generation

  // 5.b Extract suggestions -> Return suggestions entry
  const nlqQaExtractSuggestionFromPromptAppUseCase =
    new NlqQaExtractSuggestionFromPromptAppUseCase(
      loggerProvider,
      nlqQaGenerationRepository
    );
  // 6. Execute query
  const nlqQaInformationExecuteQueryUseCase =
    new NlqQaInformationExecuteQueryUseCase(
      loggerProvider,
      nlqQaInformationRepository
    );

  // 6.a Error handling of query execution ->Return Create error entry
  const createNlqQaErrorUseCase = new CreateNlqQaErrorUseCase(
    loggerProvider,
    nlqQaErrorRepository
  );

  // 7. Create NLQ QA entry -> Return NLQ QA entry
  const createNlqQaUseCase = new CreateNlqQaAppUseCase(
    nlqQaRepository,
    loggerProvider
  );

  // Controllers
  const controller: IController = new CreateNlqQaController(
    loggerProvider,
    readNlqQaKnowledgeByQuestionUseCase,
    nlqQaInformationExtractSchemaBasedUseCase,
    nlqQaCreatePromptTemplateGenerationUseCase,
    nlqQaQueryGenerationUseCase,
    nlqQaExtractQueryFromPromptAppUseCase,
    nlqQaExtractSuggestionFromPromptAppUseCase,
    nlqQaInformationExecuteQueryUseCase,
    createNlqQaErrorUseCase,
    createNlqQaUseCase
  );

  return controller;
}
