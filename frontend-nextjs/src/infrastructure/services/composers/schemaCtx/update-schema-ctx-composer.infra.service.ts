import { UpdateSchemaCtxStep } from "@/core/application/steps/schemaCtx/update-schema-ctx.step";
import { UpdateSchemaCtxUseCase } from "@/core/application/usecases/schemaCtx/update-schema-ctx.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { UpdateSchemaCtxController } from "@/http/controllers/schemaCtx/update-schema-ctx.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { SchemaCtxRepository } from "@/infrastructure/repository/schemaCtx.repo";

export function UpdateSchemaCtxComposer(): IController {
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
  const updateSchemaCtxStep = new UpdateSchemaCtxStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new UpdateSchemaCtxUseCase(
    loggerProvider,
    updateSchemaCtxStep
  );

  // CONTROLLER
  const controller = new UpdateSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
