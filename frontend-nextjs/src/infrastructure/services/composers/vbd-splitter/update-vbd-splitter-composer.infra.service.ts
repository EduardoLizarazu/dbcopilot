import { UpdateVbdSplitterUseCase } from "@/core/application/usecases/vbd-splitter/update-vbd-splitter.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { UpdateVbdSplitterController } from "@/http/controllers/vbd-splitter/update-vbd-splitter.httpt.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function UpdateVbdSplitterComposer(): IController {
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

  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);

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

  // USE CASES
  const useCase = new UpdateVbdSplitterUseCase(
    loggerProvider,
    vbdSplitterRepo,
    nlqQaGoodRepo,
    knowledgeAdapter
  );

  // CONTROLLER
  const controller = new UpdateVbdSplitterController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
