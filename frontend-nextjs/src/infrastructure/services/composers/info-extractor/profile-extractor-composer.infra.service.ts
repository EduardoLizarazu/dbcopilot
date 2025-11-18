import { ReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { ExecuteProfileOnInfoStep } from "@/core/application/steps/infoBased/execute-profile-on-info.step";
import { ExtractSchemaBasedStep } from "@/core/application/steps/infoBased/extract-schemabased.step";
import { ProfileExtractorUseCase } from "@/core/application/usecases/info-extractor/profile-extractor.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ProfileExtractorController } from "@/http/controllers/info-extractor/profile-extractor.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";

export function ProfileExtractorComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const typeOrmProvider = new TypeOrmProvider();
  const oracleProvider = new OracleProvider();

  // Repositories
  const nlqQaInfoPort = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider,
    typeOrmProvider
  );
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   Steps
  const profilePort = new ExecuteProfileOnInfoStep(
    loggerProvider,
    nlqQaInfoPort
  );
  const readByIdDbConnStep = new ReadDbConnByIdStep(loggerProvider, dbConnRepo);
  const extractSchemaBasedStep = new ExtractSchemaBasedStep(
    loggerProvider,
    nlqQaInfoPort
  );

  // Use cases
  const useCase = new ProfileExtractorUseCase(
    loggerProvider,
    profilePort,
    readByIdDbConnStep,
    extractSchemaBasedStep
  );

  // Controllers
  const controller = new ProfileExtractorController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
