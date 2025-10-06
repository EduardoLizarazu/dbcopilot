import { ReadDbConnectionWithVbdByIdUseCase } from "@/core/application/usecases/dbconnection/read-dbconnection-with-vbd-by-id.usecase";
import { ReadDbConnectionWithVbdByIdController } from "@/http/controllers/dbconnection/read-dbconnection-with-vbd-by-id.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function ReadDbConnectionWithVbdByIdComposer(): IController {
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

  // USE CASES
  const useCase = new ReadDbConnectionWithVbdByIdUseCase(
    loggerProvider,
    dbConnRepo
  );

  // CONTROLLER
  const controller = new ReadDbConnectionWithVbdByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
