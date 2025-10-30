import { ReadNlqQaByIdStep } from "@/core/application/steps/nlq-qa/read-nlq-qa-by-id.step";
import { ReadNlqQaHistoryByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-nlq-qa-history-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNlqQaHistoryByIdController } from "@/http/controllers/nlq-qa/read-nlq-qa-history-by-id.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function readNlqQaHistoryByIdComposer(): IController {
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
  //   STEPS
  const readNlqQaHistoryByIdStep = new ReadNlqQaByIdStep(
    loggerProvider,
    nlqQaRepository
  );
  // Use cases
  const readNlqQaHistoryByIdUseCase = new ReadNlqQaHistoryByIdUseCase(
    loggerProvider,
    readNlqQaHistoryByIdStep
  );

  // Controllers
  const controller: IController = new ReadNlqQaHistoryByIdController(
    loggerProvider,
    readNlqQaHistoryByIdUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
