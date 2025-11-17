import { ReadByIdSchemaCtxStep } from "@/core/application/steps/schemaCtx/read-by-id-schema-ctx.step";
import { ReadByIdSchemaCtxUseCase } from "@/core/application/usecases/schemaCtx/read-by-id-schema-ctx.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadByIdSchemaCtxController } from "@/http/controllers/schemaCtx/read-by-id-schema-ctx.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { SchemaCtxRepository } from "@/infrastructure/repository/schemaCtx.repo";

export function ReadByIdSchemaCtxComposer(): IController {
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
  const readByIdSchemaCtxStep = new ReadByIdSchemaCtxStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new ReadByIdSchemaCtxUseCase(
    loggerProvider,
    readByIdSchemaCtxStep
  );

  // CONTROLLER
  const controller = new ReadByIdSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
