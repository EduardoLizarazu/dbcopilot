import { ReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { ExecuteQueryStep } from "@/core/application/steps/infoBased/execute-query.step";
import { ReadNlqQaGoodByDbConnIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";
import { ReadChangesWithExecBySchemaUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/read-changes-with-exec-by-schema.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadChangesWithExecBySchemaController } from "@/http/controllers/nlq-qa-good/read-changes-with-exec-by-schema.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";

export function ReadChangesWithExecBySchemaComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const oracleProvider = new OracleProvider();
  const typeOrmProvider = new TypeOrmProvider();

  // REPOSITORIES
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);
  const nlqInfoPort = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider,
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

  const dbRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  //   Steps
  const readDbConnByIdStep = new ReadDbConnByIdStep(loggerProvider, dbRepo);
  const readNlqQaGoodByDbConnIdStep = new ReadNlqQaGoodByDbConnIdStep(
    loggerProvider,
    nlqQaGoodRepo
  );
  const executeQueryStep = new ExecuteQueryStep(loggerProvider, nlqInfoPort);

  // USE CASES
  const useCase = new ReadChangesWithExecBySchemaUseCase(
    loggerProvider,
    readDbConnByIdStep,
    readNlqQaGoodByDbConnIdStep,
    executeQueryStep
  );

  // CONTROLLER
  const controller = new ReadChangesWithExecBySchemaController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
