import { ReadNlqQaByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-nlq-qa-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNlqQaByIdController } from "@/http/controllers/nlq-qa/read-nlq-qa-by-id.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function readNlqQaByIdComposer(): IController {
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
  const readNlqQaByIdUseCase = new ReadNlqQaByIdUseCase(
    loggerProvider,
    nlqQaRepository
  );

  // Controllers
  const controller: IController = new ReadNlqQaByIdController(
    loggerProvider,
    readNlqQaByIdUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}

export function ReturnReadNlqQaByIdUseCase() {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);

  // Use cases
  const readNlqQaByIdUseCase = new ReadNlqQaByIdUseCase(
    loggerProvider,
    nlqQaRepository
  );
  return readNlqQaByIdUseCase;
}
