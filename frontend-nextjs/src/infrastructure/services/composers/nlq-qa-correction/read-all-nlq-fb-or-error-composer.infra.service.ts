import { ReadAllNlqQaFbOrErrorUseCase } from "@/core/application/usecases/nlq/nlq-qa-correction/read-all-nlq-fb-or-error.usecase";
import { ReadAllNlqQaUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-all-nlq-qa.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadAllNlqQaFbOrErrorController } from "@/http/controllers/nlq-qa-correction/read-all-nlq-fb-or-error.http.controller";
import { ReadAllNlqQaController } from "@/http/controllers/nlq-qa/read-all-nlq-qa.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function ReadAllNlqQaFbOrErrorComposer(): IController {
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
  const readAllNlqQaUseCase = new ReadAllNlqQaFbOrErrorUseCase(
    loggerProvider,
    nlqQaRepository
  );

  // Controllers
  const controller: IController = new ReadAllNlqQaFbOrErrorController(
    loggerProvider,
    readAllNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
