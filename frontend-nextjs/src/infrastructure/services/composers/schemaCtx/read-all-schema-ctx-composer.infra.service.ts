import { ReadAllSchemaCtxStep } from "@/core/application/steps/schemaCtx/read-all-schema-ctx.step";
import { ReadAllSchemaCtxUseCase } from "@/core/application/usecases/schemaCtx/read-all-schema-ctx.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadAllSchemaCtxController } from "@/http/controllers/schemaCtx/read-all-schema-ctx.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { SchemaCtxRepository } from "@/infrastructure/repository/schemaCtx.repo";

export function ReadAllSchemaCtxComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const schemaRepo = new SchemaCtxRepository(loggerProvider, firebaseAdmin);

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
  const readAllSchemaCtxStep = new ReadAllSchemaCtxStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new ReadAllSchemaCtxUseCase(
    loggerProvider,
    readAllSchemaCtxStep
  );

  // CONTROLLER
  const controller = new ReadAllSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
