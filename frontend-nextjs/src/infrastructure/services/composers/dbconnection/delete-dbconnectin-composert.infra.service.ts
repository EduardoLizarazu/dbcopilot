import { DeleteDbConnectionUseCase } from "@/core/application/usecases/dbconnection/delete-dbconnection.usecase";
import { DeleteDbConnectionController } from "@/http/controllers/dbconnection/delete-dbconnection.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";

export function DeleteDbConnectionComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
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
  const useCase = new DeleteDbConnectionUseCase(loggerProvider, dbConnRepo);

  // CONTROLLER
  const controller = new DeleteDbConnectionController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
