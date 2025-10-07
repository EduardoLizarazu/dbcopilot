import { NlqQaInfoExtractorUseCase } from "@/core/application/usecases/info-extractor/info-extractor.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { InfoExtractorController } from "@/http/controllers/info-extractor/info-extractor.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";

export function infoExtractorQaComposer(): IController {
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

  // Use cases
  const createNlqQaUseCase = new NlqQaInfoExtractorUseCase(
    loggerProvider,
    nlqQaInfoPort,
    dbConnRepo
  );

  // Controllers
  const controller = new InfoExtractorController(
    loggerProvider,
    createNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
