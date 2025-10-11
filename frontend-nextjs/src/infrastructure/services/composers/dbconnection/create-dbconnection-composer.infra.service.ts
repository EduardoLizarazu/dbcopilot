import { CreateDbConnStep } from "@/core/application/steps/dbconn/create-dbconn.step";
import { ValidateInputCreateDbConnStep } from "@/core/application/steps/dbconn/validate-input-create-dbconn.step";
import { CreateDbConnectionUseCase } from "@/core/application/usecases/dbconnection/create-dbconnection.usecase";
import { CreateDbConnectionController } from "@/http/controllers/dbconnection/create-dbconnection.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function CreateDbConnectionComposer(): IController {
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
  const validateInputDbConnStep = new ValidateInputCreateDbConnStep(
    loggerProvider
  );

  const createDbConnStep = new CreateDbConnStep(
    loggerProvider,
    dbConnRepo,
    vbdSplitterRepo
  );

  // USE CASES
  const useCase = new CreateDbConnectionUseCase(
    loggerProvider,
    validateInputDbConnStep,
    createDbConnStep
  );

  // CONTROLLER
  const controller = new CreateDbConnectionController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
