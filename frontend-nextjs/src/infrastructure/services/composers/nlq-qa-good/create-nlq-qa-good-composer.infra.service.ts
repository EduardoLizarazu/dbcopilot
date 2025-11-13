import { ReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { AddToTheKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/add-to-knowledge-base.step";
import { CreateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/create-nlq-qa-good.step";
import { UpdateNlqQaGoodKnowledgeStep } from "@/core/application/steps/nlq-qa-good/update-nlq-qa-good-knowledge.step";
import { ValidateCreateNlqQaGoodInputDataStep } from "@/core/application/steps/nlq-qa-good/validate-create-nlq-qa-good-input-data.step";
import { UpdateNlqQaGoodFieldFromGoodStep } from "@/core/application/steps/nlq-qa/update-nlq-qa-good-field-from-good.step";
import { CreateNlqQaGoodUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/create-nlq-qa-good.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaGoodController } from "@/http/controllers/nlq-qa-good/create-nlq-qa-good.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function createNlqQaGoodComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();

  // REPOSITORIES
  const nlqQaRepo = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const nlqQaGoodRepo = new NlqQaGoodRepository(loggerProvider, firebaseAdmin);
  const dbConnRepo = new DbConnectionRepository(loggerProvider, firebaseAdmin);

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

  // STEPS
  const validateInputDataStep = new ValidateCreateNlqQaGoodInputDataStep(
    loggerProvider
  );

  const ensureDbConnWithSplitterExistsStep =
    new ReadDbConnectionWithSplitterAndSchemaQueryStep(
      loggerProvider,
      dbConnRepo
    );

  const createNlqQaGoodStep = new CreateNlqQaGoodStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const addToKnowledgeSource = new AddToTheKnowledgeBaseStep(
    loggerProvider,
    nlqQaKnowledgeAdapter
  );

  const updateNlqQaGoodOnKnowledgeStep = new UpdateNlqQaGoodKnowledgeStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const updateNlqQaIfOriginIdStep = new UpdateNlqQaGoodFieldFromGoodStep(
    loggerProvider,
    nlqQaRepo
  );

  // USE CASES
  const useCase = new CreateNlqQaGoodUseCase(
    loggerProvider,
    validateInputDataStep,
    ensureDbConnWithSplitterExistsStep,
    createNlqQaGoodStep,
    addToKnowledgeSource,
    updateNlqQaGoodOnKnowledgeStep,
    updateNlqQaIfOriginIdStep
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
