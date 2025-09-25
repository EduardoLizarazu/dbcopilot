import { CreateNlqQaUseCase } from "@/core/application/usecases/nlq/nlq-qa/create-nlq-qa.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaController } from "@/http/controllers/nlq-qa/create-nlq-qa.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-generation.adapter";
import { NlqQaInformationAdapter } from "@/infrastructure/adapters/nlq-qa-information.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaErrorRepository } from "@/infrastructure/repository/nlq/nlq-qa-error.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";
import { UserInfraRepository } from "@/infrastructure/repository/user.infra.repo";

export function createNlqQaComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();
  const oracleProvider = new OracleProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const nlqQaKnowledgeAdapter = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openAiProvider
  );
  const nlqQaInformationAdapter = new NlqQaInformationAdapter(
    loggerProvider,
    oracleProvider
  );
  const nlqQaGenerationAdapter = new NlqQaGenerationAdapter(
    loggerProvider,
    openAiProvider
  );
  const nlqQaErrorRepository = new NlqQaErrorRepository(
    loggerProvider,
    firebaseAdmin
  );
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // Use cases
  const createNlqQaUseCase = new CreateNlqQaUseCase(
    loggerProvider,
    nlqQaRepository,
    nlqQaKnowledgeAdapter,
    nlqQaInformationAdapter,
    nlqQaGenerationAdapter,
    nlqQaErrorRepository
  );

  // Controllers
  const controller: IController = new CreateNlqQaController(
    loggerProvider,
    createNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
