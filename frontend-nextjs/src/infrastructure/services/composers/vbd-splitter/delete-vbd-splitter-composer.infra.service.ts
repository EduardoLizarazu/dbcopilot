import { ReadAllDbConnBySplitterIdStep } from "@/core/application/steps/dbconn/read-all-dbconn-by-splitter-id.step";
import { DeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { DeleteSplitterOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/delete-splitter-on-knowledge-base.step";
import { DeleteVbdSplitterByIdStep } from "@/core/application/steps/vbd-splitter/delete-vbd-splitter-by-id.step";
import { ReadVbdSplitterByIdStep } from "@/core/application/steps/vbd-splitter/read-vbd-splitter-by-id.step";
import { DeleteVbdSplitterUseCase } from "@/core/application/usecases/vbd-splitter/delete-vbd-splitter.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { DeleteVbdSplitterController } from "@/http/controllers/vbd-splitter/delete-vbd-splitter.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function DeleteVbdSplitterComposer(): IController {
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

  //   PORTS
  const knowledgeAdapter = new NlqQaKnowledgeAdapter(
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
  const checkIfVbdSplitterExists = new ReadVbdSplitterByIdStep(
    loggerProvider,
    vbdSplitterRepo
  );

  const checkIfVbdSplitterIsUsedInDbConnections =
    new ReadAllDbConnBySplitterIdStep(loggerProvider, dbConnRepo);

  const deleteSplitterFromKnowledgeBase = new DeleteSplitterOnKnowledgeBaseStep(
    loggerProvider,
    knowledgeAdapter
  );

  const deleteVbdSplitterByIdStep = new DeleteVbdSplitterByIdStep(
    loggerProvider,
    vbdSplitterRepo
  );

  // USE CASES
  const useCase = new DeleteVbdSplitterUseCase(
    loggerProvider,
    checkIfVbdSplitterExists,
    checkIfVbdSplitterIsUsedInDbConnections,
    deleteSplitterFromKnowledgeBase,
    deleteVbdSplitterByIdStep
  );

  // CONTROLLER
  const controller = new DeleteVbdSplitterController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
