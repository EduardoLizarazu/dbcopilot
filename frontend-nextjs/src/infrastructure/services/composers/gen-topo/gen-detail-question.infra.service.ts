import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { GenerateDetailQuestionController } from "@/http/controllers/gen-topo/gen-detail-question.http.controller";
import { GenerateDetailQuestionUseCase } from "@/core/application/usecases/gen-topo/generate-detail-question.usecase";
import { GenDetailQuestionStep } from "@/core/application/steps/genTepology/gen-detail-question.step";

export function genDetailQuestionComposer(): IController {
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
  const genDetailQuestionStep = new GenDetailQuestionStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );
  // Use cases
  const createNlqQaUseCase = new GenerateDetailQuestionUseCase(
    loggerProvider,
    genDetailQuestionStep
  );

  // Controllers
  const controller: IController = new GenerateDetailQuestionController(
    loggerProvider,
    createNlqQaUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
