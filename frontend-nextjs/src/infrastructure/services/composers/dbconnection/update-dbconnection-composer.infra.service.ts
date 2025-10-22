import { ReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { UpdateDbConnStep } from "@/core/application/steps/dbconn/update-dbconn.step";
import { ValidateInputUpdateDbConnStep } from "@/core/application/steps/dbconn/validate-input-update-dbconn.step";
import { TransferSplitterToNewOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/transfer-splitter-to-new-on-knowledge-base.step";
import { ReadNlqQaGoodByDbConnIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";
import { ReadSchemaByConnIdStep } from "@/core/application/steps/schema/read-schema-by-connection-id.step";
import { UpdateConnOnSchemaStep } from "@/core/application/steps/schema/update-conn-on-schema.step";
import { ReadVbdSplitterByIdStep } from "@/core/application/steps/vbd-splitter/read-vbd-splitter-by-id.step";
import { UpdateDbConnectionUseCase } from "@/core/application/usecases/dbconnection/update-dbconnection.usecase";
import { UpdateDbConnectionController } from "@/http/controllers/dbconnection/update-dbconnection.http.controller";
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

export function UpdateDbConnectionComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const pineconeProvider = new PineconeProvider();
  const openaiProvider = new OpenAIProvider();

  // REPOSITORIES
  const vbdSplitterRepo = new VbdSplitterRepository(
    loggerProvider,
    firebaseAdmin
  );
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);

  const knowledgeSourcePort = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openaiProvider
  );

  const schemaRepo = new SchemaRepository(loggerProvider, firebaseAdmin);

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
  const validateUpdateInputDbConnStep = new ValidateInputUpdateDbConnStep(
    loggerProvider
  );

  const readDbConnById = new ReadDbConnByIdStep(loggerProvider, dbConnRepo);

  const readSplitterByIdStep = new ReadVbdSplitterByIdStep(
    loggerProvider,
    vbdSplitterRepo
  );

  const readNlqQaGoodByDbConnIdStep = new ReadNlqQaGoodByDbConnIdStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const updateDbConnStep = new UpdateDbConnStep(
    loggerProvider,
    dbConnRepo,
    vbdSplitterRepo
  );

  const transferSplitterToNewOnKnowledgeBaseStep =
    new TransferSplitterToNewOnKnowledgeBaseStep(
      loggerProvider,
      knowledgeSourcePort
    );

  const readSchemaByConnId = new ReadSchemaByConnIdStep(
    loggerProvider,
    schemaRepo
  );

  const updateConnOnSchemaStep = new UpdateConnOnSchemaStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new UpdateDbConnectionUseCase(
    loggerProvider,
    validateUpdateInputDbConnStep,
    readDbConnById,
    readSplitterByIdStep,
    readNlqQaGoodByDbConnIdStep,
    updateDbConnStep,
    transferSplitterToNewOnKnowledgeBaseStep,
    readSchemaByConnId,
    updateConnOnSchemaStep
  );

  // CONTROLLER
  const controller = new UpdateDbConnectionController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
