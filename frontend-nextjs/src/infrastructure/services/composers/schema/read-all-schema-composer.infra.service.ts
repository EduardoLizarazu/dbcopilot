import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { ReadAllSchemaUseCase } from "@/core/application/usecases/schema/read-all-schema.usecase";
import { ReadAllSchemaController } from "@/http/controllers/schema/read-all-schema.http.controller";
import { SchemaRepository } from "@/infrastructure/repository/schema/schema.repo";
import { ReadAllSchemaStep } from "@/core/application/steps/schema/read-all-schema.step";

export function readAllSchemaComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const schemaRepo = new SchemaRepository(loggerProvider, firebaseAdmin);

  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   steps
  const readAllSchemaStep = new ReadAllSchemaStep(loggerProvider, schemaRepo);

  // Use case

  const useCase = new ReadAllSchemaUseCase(loggerProvider, readAllSchemaStep);

  const controller: IController = new ReadAllSchemaController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
