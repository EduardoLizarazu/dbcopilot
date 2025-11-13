import { ReadAllNlqQaFbOrErrorUseCase } from "@/core/application/usecases/nlq/nlq-qa-correction/read-all-nlq-fb-or-error.usecase";
import { ReadNlqQaFbOrErrorByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa-correction/read-nlq-fb-or-error-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNlqQaFbOrErrorByIdController } from "@/http/controllers/nlq-qa-correction/read-nlq-fb-or-error-by-id.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function ReadNlqQaFbOrErrorByIdComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);

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
  const useCase = new ReadNlqQaFbOrErrorByIdUseCase(
    loggerProvider,
    nlqQaRepository
  );

  // Controllers
  const controller: IController = new ReadNlqQaFbOrErrorByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
