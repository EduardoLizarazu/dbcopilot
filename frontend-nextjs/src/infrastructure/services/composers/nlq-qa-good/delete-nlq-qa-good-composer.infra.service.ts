import { ReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { DeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { DeleteNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/delete-nlq-qa-good.step";
import { ReadNlqQaGoodByIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-id.step";
import { DeleteQaGoodUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/delete-qa-good.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { DeleteNlqQaGoodByIdController } from "@/http/controllers/nlq-qa-good/delete-nlq-qa-good.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";

export function DeleteNlqQaGoodComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const pineconeProvider = new PineconeProvider();
  const openAiProvider = new OpenAIProvider();

  // REPOSITORIES
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  // Others utils
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );

  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   PORTS
  const knowledgeBasePort = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openAiProvider
  );

  //   STEPS
  const readNlqQaGoodByIdStep = new ReadNlqQaGoodByIdStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const readDbConnectionWithSplitterAndSchemaQueryStep =
    new ReadDbConnectionWithSplitterAndSchemaQueryStep(
      loggerProvider,
      dbConnRepo
    );

  const deleteOnKnowledgeBaseByIdStep = new DeleteOnKnowledgeBaseByIdStep(
    loggerProvider,
    knowledgeBasePort
  );

  const deleteNlqQaGoodStep = new DeleteNlqQaGoodStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  // USE CASES
  const useCase = new DeleteQaGoodUseCase(
    loggerProvider,
    readNlqQaGoodByIdStep,
    readDbConnectionWithSplitterAndSchemaQueryStep,
    deleteOnKnowledgeBaseByIdStep,
    deleteNlqQaGoodStep
  );

  // CONTROLLER
  const controller = new DeleteNlqQaGoodByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
