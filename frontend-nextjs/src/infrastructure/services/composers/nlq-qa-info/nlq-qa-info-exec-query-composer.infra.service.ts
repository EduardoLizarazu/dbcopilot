import { IController } from "@/http/controllers/IController.http.controller";
import { NlqQaInfoExecQueryController } from "@/http/controllers/nlq-qa-information/nlq-qa-information-execute-query.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";

export function NlqQaInfoExecQueryComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const oracleProvider = new OracleProvider();

  // Repositories
  const nlqQaInformationAdapter = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider
  );

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

  // Controllers
  const controller: IController = new NlqQaInfoExecQueryController(
    loggerProvider,
    nlqQaInformationAdapter,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
