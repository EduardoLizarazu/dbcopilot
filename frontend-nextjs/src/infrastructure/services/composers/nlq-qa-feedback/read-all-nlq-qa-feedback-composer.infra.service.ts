import { ReadAllNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/read-all-nlq-qa-feedback.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadAllNlqQaFeedbackController } from "@/http/controllers/nlq-qa-feedback/read-all-nlq-qa-feedback.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaFeedbackRepository } from "@/infrastructure/repository/nlq/nlq-qa-feedback.repo";

export function readAllNlqQaFeedbackComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const nlqQaFeedbackRepository = new NlqQaFeedbackRepository(
    loggerProvider,
    firebaseAdmin
  );
  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // USE CASES
  const useCase = new ReadAllNlqQaFeedbackUseCase(
    loggerProvider,
    nlqQaFeedbackRepository
  );

  // CONTROLLER
  const controller: IController = new ReadAllNlqQaFeedbackController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
