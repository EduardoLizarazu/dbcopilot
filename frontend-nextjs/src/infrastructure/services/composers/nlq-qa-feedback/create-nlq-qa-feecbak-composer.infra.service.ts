import { CreateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaFeedbackController } from "@/http/controllers/nlq-qa-feedback/create-nlq-qa-feedback.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaFeedbackRepository } from "@/infrastructure/repository/nlq/nlq-qa-feedback.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function createNlqQaFeedbackComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  //   REPOSITORIES
  const nlqQaFeedbackRepository = new NlqQaFeedbackRepository(
    loggerProvider,
    firebaseAdmin
  );
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);

  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   USE CASES
  const useCase = new CreateNlqQaFeedbackUseCase(
    loggerProvider,
    nlqQaFeedbackRepository,
    nlqQaRepository
  );

  //   CONTROLLER
  const controller: IController = new CreateNlqQaFeedbackController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
