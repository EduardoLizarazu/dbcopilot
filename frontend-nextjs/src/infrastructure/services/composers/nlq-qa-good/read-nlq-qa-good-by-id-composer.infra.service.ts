import { ReadNlqQaGoodByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/read-nlq-qa-good-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNlqQaGoodByIdController } from "@/http/controllers/nlq-qa-good/read-nlq-qa-good-by-id.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";

export function readNlqQaGoodByIdComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);

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
  const useCase = new ReadNlqQaGoodByIdUseCase(loggerProvider, nlqQaGoodRepo);

  // CONTROLLER
  const controller = new ReadNlqQaGoodByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}

export function ReturnReadNlqQaGoodByIdUseCase() {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);

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
  const useCase = new ReadNlqQaGoodByIdUseCase(loggerProvider, nlqQaGoodRepo);
  return useCase;
}
