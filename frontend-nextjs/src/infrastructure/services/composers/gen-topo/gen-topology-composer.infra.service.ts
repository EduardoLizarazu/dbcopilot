import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { GenerateTopologyController } from "@/http/controllers/gen-topo/gen-topology.http.controller";
import { GenTopologyUseCase } from "@/core/application/usecases/gen-topo/generate-topology.usecase";
import { GenTopologyValidDataInRqStep } from "@/core/application/steps/genTepology/gen-topo-valid-data-in-rq.step";
import { GenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { GenSemanticFieldsStep } from "@/core/application/steps/genTepology/gen-semantic-fields.step";
import { GenSemanticTableStep } from "@/core/application/steps/genTepology/gen-semantic-table.step";
import { GenSemanticFlagsStep } from "@/core/application/steps/genTepology/gen-semantic-flags.step";
import { GenThinkingProcessStep } from "@/core/application/steps/genTepology/gen-thinking-process.step";

export function genTopologyComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();

  // Repositories
  const nlqQaTopoGenAdapter = new NlqQaTopologyGenerationAdapter(
    loggerProvider,
    openAiProvider
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

  // STEPS
  const genTopologyValidDataInRqStep = new GenTopologyValidDataInRqStep(
    loggerProvider
  );
  const genTableColumnsStep = new GenTableColumnsStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );

  const genSemanticFieldsStep = new GenSemanticFieldsStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );

  const genSemanticTablesStep = new GenSemanticTableStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );

  const genSemanticFlagsStep = new GenSemanticFlagsStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );

  const genThinkingProcessStep = new GenThinkingProcessStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );

  // Use cases
  const createNlqQaUseCase = new GenTopologyUseCase(
    loggerProvider,
    genTopologyValidDataInRqStep,
    genTableColumnsStep,
    genSemanticFieldsStep,
    genSemanticTablesStep,
    genSemanticFlagsStep,
    genThinkingProcessStep
  );

  // Controllers
  const controller: IController = new GenerateTopologyController(
    loggerProvider,
    createNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
