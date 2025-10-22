import { DeleteDbConnStep } from "@/core/application/steps/dbconn/delete-dbconn.step";
import { ReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { DeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { ReadNlqQaGoodByDbConnIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";
import { RemoveDbConnOnNlqQaGoodByIdStep } from "@/core/application/steps/nlq-qa-good/remove-dbconn-on-nlq-qa-good.step";
import { DeleteConnSchemaStep } from "@/core/application/steps/schema/delete-conn-schema.step";
import { ReadVbdSplitterByIdStep } from "@/core/application/steps/vbd-splitter/read-vbd-splitter-by-id.step";
import { DeleteDbConnectionUseCase } from "@/core/application/usecases/dbconnection/delete-dbconnection.usecase";
import { DeleteDbConnectionController } from "@/http/controllers/dbconnection/delete-dbconnection.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";
import { SchemaRepository } from "@/infrastructure/repository/schema/schema.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function DeleteDbConnectionComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openaiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();

  // REPOSITORIES
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);
  const vbdSplitterRepo = new VbdSplitterRepository(
    loggerProvider,
    firebaseAdmin
  );
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);
  const schemaRepo = new SchemaRepository(loggerProvider, firebaseAdmin);

  const knowledgeBaseAdapter = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openaiProvider
  );

  // Others utils
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );

  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // STEPS
  const checkIfDbConnExists = new ReadDbConnByIdStep(
    loggerProvider,
    dbConnRepo
  );

  const readSplitterByIdStep = new ReadVbdSplitterByIdStep(
    loggerProvider,
    vbdSplitterRepo
  );

  const readNlqQaGoodByDbConnId = new ReadNlqQaGoodByDbConnIdStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const deleteOnKnowledgeBaseById = new DeleteOnKnowledgeBaseByIdStep(
    loggerProvider,
    knowledgeBaseAdapter
  );

  const removeDbConnOnNlqQaGoodById = new RemoveDbConnOnNlqQaGoodByIdStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const deleteDbConnStep = new DeleteDbConnStep(loggerProvider, dbConnRepo);

  const deleteConnOnSchemaStep = new DeleteConnSchemaStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new DeleteDbConnectionUseCase(
    loggerProvider,
    checkIfDbConnExists,
    readSplitterByIdStep,
    readNlqQaGoodByDbConnId,
    deleteOnKnowledgeBaseById,
    removeDbConnOnNlqQaGoodById,
    deleteDbConnStep,
    deleteConnOnSchemaStep
  );

  // CONTROLLER
  const controller = new DeleteDbConnectionController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
