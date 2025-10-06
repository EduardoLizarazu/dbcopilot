import { ExtractSchemaDbConnectionUseCase } from "@/core/application/usecases/dbconnection/extract-schema-dbconnection.usecase";
import { ExtractSchemaDbConnectionController } from "@/http/controllers/dbconnection/extract-schema-dbconnection.http.controller";
import { IController } from "@/http/controllers/IController.http.controller";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "@/infrastructure/providers/database/typeorm.infra.provider";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";

export function ExtractSchemaDbConnectionComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const oracleProvider = new OracleProvider();
  const typeOrmProvider = new TypeOrmProvider();

  // REPOSITORIES

  //   PORTS
  const infoAdapter = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider,
    typeOrmProvider
  );

  // USE CASES
  const useCase = new ExtractSchemaDbConnectionUseCase(
    loggerProvider,
    infoAdapter
  );

  // CONTROLLER
  const controller = new ExtractSchemaDbConnectionController(
    loggerProvider,
    useCase
  );
  return controller;
}
