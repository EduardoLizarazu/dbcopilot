import { UpdateSplitterNameOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/update-splitter-name-on-knowledge-base.step";
import { ReadVbdSplitterByIdStep } from "@/core/application/steps/vbd-splitter/read-vbd-splitter-by-id.step";
import { UpdateVbdSplitterStep } from "@/core/application/steps/vbd-splitter/update-vbd-splitter.step";
import { VbdSplitterValidInputRqUpdateStep } from "@/core/application/steps/vbd-splitter/vbd-splitter-valid-input-rq-update.step";
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
  const readVbdSplitterByIdStep = new ReadVbdSplitterByIdStep(
    loggerProvider,
    vbdSplitterRepo
  );

  const validateVbdSplitterInput = new VbdSplitterValidInputRqUpdateStep(
    loggerProvider
  );

  const updateSplitterNameOnKnowledgeBaseStep =
    new UpdateSplitterNameOnKnowledgeBaseStep(loggerProvider, knowledgeAdapter);

  const updateVbdSplitterStep = new UpdateVbdSplitterStep(
    loggerProvider,
    vbdSplitterRepo
  );

  // USE CASES
  const useCase = new UpdateVbdSplitterUseCase(
    loggerProvider,
    readVbdSplitterByIdStep,
    validateVbdSplitterInput,
    updateSplitterNameOnKnowledgeBaseStep,
    updateVbdSplitterStep
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
