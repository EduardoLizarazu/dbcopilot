import { ReadAllBadForCorrectionUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-all-bad-for-correction.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadAllBadNlqQaController } from "@/http/controllers/nlq-qa/read-all-bad-nlq-qa.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaErrorRepository } from "@/infrastructure/repository/nlq/nlq-qa-error.repo";
import { NlqQaFeedbackRepository } from "@/infrastructure/repository/nlq/nlq-qa-feedback.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";
import { UserRepository } from "@/infrastructure/repository/user.repo";

export function ReadAllBadNlqQaComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const userRepo = new UserRepository(
    loggerProvider,
    firebaseAdmin,
    firebaseClient
  );
  const fbRepo = new NlqQaFeedbackRepository(loggerProvider, firebaseAdmin);
  const errorRepo = new NlqQaErrorRepository(loggerProvider, firebaseAdmin);
  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // Use cases
  const readAllBadNlqQaUseCase = new ReadAllBadForCorrectionUseCase(
    loggerProvider,
    nlqQaRepository,
    fbRepo,
    errorRepo,
    userRepo
  );

  // Controllers
  const controller: IController = new ReadAllBadNlqQaController(
    loggerProvider,
    readAllBadNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
