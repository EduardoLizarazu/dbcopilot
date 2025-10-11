import { UpdateDbConnStep } from "@/core/application/steps/dbconn/update-dbconn.step";
import { ValidateInputUpdateDbConnStep } from "@/core/application/steps/dbconn/validate-input-update-dbconn.step";
import { UpdateDbConnectionUseCase } from "@/core/application/usecases/dbconnection/update-dbconnection.usecase";
import { UpdateDbConnectionController } from "@/http/controllers/dbconnection/update-dbconnection.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function UpdateDbConnectionComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const vbdSplitterRepo = new VbdSplitterRepository(
    loggerProvider,
    firebaseAdmin
  );
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  // Others utils
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );

  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // STEPS
  const validateUpdateInputDbConnStep = new ValidateInputUpdateDbConnStep(
    loggerProvider
  );

  const updateDbConnStep = new UpdateDbConnStep(
    loggerProvider,
    dbConnRepo,
    vbdSplitterRepo
  );

  // USE CASES
  const useCase = new UpdateDbConnectionUseCase(
    loggerProvider,
    validateUpdateInputDbConnStep,
    updateDbConnStep
  );

  // CONTROLLER
  const controller = new UpdateDbConnectionController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
