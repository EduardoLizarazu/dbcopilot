import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { ReadNlqQaErrorByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa-error/read-nlq-qa-error-by-id.usecase";
import { ReadNlqQaErrorByIdController } from "@/http/controllers/nlq-qa-error/read-nlq-qa-error-by-id.http.controller";
import { NlqQaErrorRepository } from "@/infrastructure/repository/nlq/nlq-qa-error.repo";

export function ReadNlqQaErrorByIdComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
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

  const useCase = new ReadNlqQaErrorByIdUseCase(loggerProvider, errorRepo);

  const controller: IController = new ReadNlqQaErrorByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
