import { ReadUserRolesByUserIdStep } from "@/core/application/steps/auth/read-user-role-by-user-id.step";
import { ReadAllNlqQaByUserIdStep } from "@/core/application/steps/nlq-qa/read-all-nlq-qa-base-on-user.step";
import { ReadAllNlqQaStep } from "@/core/application/steps/nlq-qa/read-all-nlq-qa.step";
import { ReadNlqQaHistoryUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-nlq-qa-history.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNlqQaHistoryController } from "@/http/controllers/nlq-qa/read-nlq-qa-history.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function readNlqQaHistoryComposer(): IController {
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
  const readAllNlqQaByUserIdStep = new ReadAllNlqQaByUserIdStep(
    loggerProvider,
    nlqQaRepository
  );

  const readAllNlqQaStep = new ReadAllNlqQaStep(
    loggerProvider,
    nlqQaRepository
  );

  const readUserRolesByUserIdStep = new ReadUserRolesByUserIdStep(
    loggerProvider,
    authRepository
  );

  // Use cases
  const readNlqQaHistoryUseCase = new ReadNlqQaHistoryUseCase(
    loggerProvider,
    readAllNlqQaByUserIdStep,
    readAllNlqQaStep,
    readUserRolesByUserIdStep
  );

  // Controllers
  const controller: IController = new ReadNlqQaHistoryController(
    loggerProvider,
    readNlqQaHistoryUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
