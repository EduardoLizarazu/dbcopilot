import { ReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { GenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { AddToTheKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/add-to-knowledge-base.step";
import { DeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { DeleteNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/delete-nlq-qa-good.step";
import { UpdateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/update-nlq-qa-good.step";
import { ValidateUpdateNlqQaGoodInputDataStep } from "@/core/application/steps/nlq-qa-good/validate-update-nlq-qa-good-input-data.step";
import { UpdateNlqQaGoodUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/update-nlq-qa-good.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { UpdateNlqQaGoodController } from "@/http/controllers/nlq-qa-good/update-nlq-qa-good.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { NlqQaKnowledgeAdapter } from "@/infrastructure/adapters/nlq-qa-knowledge.adapter";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";

export function updateNlqQaGoodComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();
  const pineconeProvider = new PineconeProvider();

  // REPOSITORIES
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
  const genTopoAdapter = new NlqQaTopologyGenerationAdapter(
    loggerProvider,
    openAiProvider
  );

  // STEPS
  const validateUpdateNlqQaGoodInputDataStep =
    new ValidateUpdateNlqQaGoodInputDataStep(loggerProvider);

  const ensureDbConnWithSplitterExistsStep =
    new ReadDbConnectionWithSplitterAndSchemaQueryStep(
      loggerProvider,
      dbConnRepo
    );

  const addToKnowledgeBaseStep = new AddToTheKnowledgeBaseStep(
    loggerProvider,
    nlqQaKnowledgeAdapter
  );

  const deleteOnKnowledgeBaseByIdStep = new DeleteOnKnowledgeBaseByIdStep(
    loggerProvider,
    nlqQaKnowledgeAdapter
  );

  const updateNlqQaGoodStep = new UpdateNlqQaGoodStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const deleteNlqQaGoodStep = new DeleteNlqQaGoodStep(
    loggerProvider,
    nlqQaGoodRepo
  );

  const genTableColumnsStep = new GenTableColumnsStep(
    loggerProvider,
    genTopoAdapter
  );

  // USE CASES
  const useCase = new UpdateNlqQaGoodUseCase(
    loggerProvider,
    validateUpdateNlqQaGoodInputDataStep,
    ensureDbConnWithSplitterExistsStep,
    addToKnowledgeBaseStep,
    deleteOnKnowledgeBaseByIdStep,
    deleteNlqQaGoodStep,
    updateNlqQaGoodStep,
    genTableColumnsStep
  );

  // CONTROLLER
  const controller = new UpdateNlqQaGoodController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
