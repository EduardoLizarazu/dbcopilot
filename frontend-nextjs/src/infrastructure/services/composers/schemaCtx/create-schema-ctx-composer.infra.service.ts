import { CreateSchemaCtxStep } from "@/core/application/steps/schemaCtx/create-schema-ctx.step";
import { FormatSchemaCtxStep } from "@/core/application/steps/schemaCtx/format-schema-ctx.step";
import { CreateSchemaCtxUseCase } from "@/core/application/usecases/schemaCtx/create-schema-ctx.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateSchemaCtxController } from "@/http/controllers/schemaCtx/create-schema-ctx.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { SchemaCtxRepository } from "@/infrastructure/repository/schemaCtx.repo";

export function CreateSchemaCtxComposer(): IController {
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
  const createSchemaCtxStep = new CreateSchemaCtxStep(
    loggerProvider,
    schemaRepo
  );

  const formatSchemaCtxStep = new FormatSchemaCtxStep(loggerProvider);

  // USE CASES
  const useCase = new CreateSchemaCtxUseCase(
    loggerProvider,
    formatSchemaCtxStep,
    createSchemaCtxStep
  );

  // CONTROLLER
  const controller = new CreateSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
