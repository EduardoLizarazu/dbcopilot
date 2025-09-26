import { CreateNlqQaGoodUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/create-nlq-qa-good.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaGoodController } from "@/http/controllers/nlq-qa-good/create-nlq-qa-good.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";

export function createNlqQaGoodComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();
  const oracleProvider = new OracleProvider();

  // REPOSITORIES
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);

  // Others utils
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );

  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   PORTS
  const nlqQaKnowledgeAdapter = new NlqQaKnowledgeAdapter(
    loggerProvider,
    pineconeProvider,
    openAiProvider
  );

  const nlqQaTopologyAdapter = new NlqQaTopologyGenerationAdapter(
    loggerProvider,
    openAiProvider
  );

  // USE CASES
  const useCase = new CreateNlqQaGoodUseCase(
    loggerProvider,
    nlqQaGoodRepo,
    nlqQaTopologyAdapter,
    nlqQaKnowledgeAdapter
  );

  // CONTROLLER
  const controller = new CreateNlqQaGoodController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
