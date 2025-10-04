"use server";
import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";

export async function NlqQaInfoExecQuery(
  query: string
): Promise<TNlqInformationData> {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const oracleProvider = new OracleProvider();

  // Repositories
  const nlqQaInformationAdapter = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider
  );

  try {
    const infoData = await nlqQaInformationAdapter.executeQuery(query);
    return infoData;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);

    loggerProvider.error("Error executing query:", errorMessage);
    throw new Error(`Error executing query: ${errorMessage}`);
  }
}
