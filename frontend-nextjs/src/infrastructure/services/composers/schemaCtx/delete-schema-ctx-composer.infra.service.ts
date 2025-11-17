import { DeleteSchemaCtxStep } from "@/core/application/steps/schemaCtx/delete-schema-ctx.step";
import { DeleteSchemaCtxUseCase } from "@/core/application/usecases/schemaCtx/delete-schema-ctx.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { DeleteSchemaCtxController } from "@/http/controllers/schemaCtx/delete-schema-ctx.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { SchemaCtxRepository } from "@/infrastructure/repository/schemaCtx.repo";

export function DeleteSchemaCtxComposer(): IController {
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
  const deleteSchemaCtxStep = new DeleteSchemaCtxStep(
    loggerProvider,
    schemaRepo
  );

  // USE CASES
  const useCase = new DeleteSchemaCtxUseCase(
    loggerProvider,
    deleteSchemaCtxStep
  );

  // CONTROLLER
  const controller = new DeleteSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
