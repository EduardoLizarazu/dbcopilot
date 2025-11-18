import { ReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { ExtractSchemaBasedStep } from "@/core/application/steps/infoBased/extract-schemabased.step";
import { FormatSchemaCtxStep } from "@/core/application/steps/schemaCtx/format-schema-ctx.step";
import { MergeSchemaCtxRawStep } from "@/core/application/steps/schemaCtx/merge-schema-ctx-raw.step";
import { ReadNewSchemasByConnIdsUseCase } from "@/core/application/usecases/schemaCtx/read-new-schemas-by-conn-ids.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadNewSchemaCtxByConnIdsController } from "@/http/controllers/schemaCtx/read-new-schemas-by-conn-ids.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";

export function ReadNewSchemasByConnIdsComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const oracle = new OracleProvider();
  const typeOrmProvider = new TypeOrmProvider();

  // REPOSITORIES
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);
  const nlqInfoPort = new NlqQaInformationAdapter(
    loggerProvider,
    oracle,
    typeOrmProvider
  );

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
  const readByIdDbConnStep = new ReadDbConnByIdStep(loggerProvider, dbConnRepo);
  const extractSchemaBasedStep = new ExtractSchemaBasedStep(
    loggerProvider,
    nlqInfoPort
  );
  const mergeSchemaCtxRawStep = new MergeSchemaCtxRawStep(loggerProvider);
  const formatSchemaCtxStep = new FormatSchemaCtxStep(loggerProvider);

  // USE CASES
  const useCase = new ReadNewSchemasByConnIdsUseCase(
    loggerProvider,
    readByIdDbConnStep,
    extractSchemaBasedStep,
    mergeSchemaCtxRawStep,
    formatSchemaCtxStep
  );

  // CONTROLLER
  const controller = new ReadNewSchemaCtxByConnIdsController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
