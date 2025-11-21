import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { GenNewQuestionQueryFromOldController } from "@/http/controllers/gen-query/gen-new-question-query-from-old.http.controller";
import { GenNewQuestionAndQueryFromOldUseCase } from "@/core/application/usecases/gen-query/gen-new-question-query-from-old.usecase";
import { GenNewQuestionAndQueryFromOldStep } from "@/core/application/steps/genQuery/gen-new-question-query-from-old.step";
import { NlqQaGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-generation.adapter";

export function GenNewQuestionQueryFromOldComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const openAiProvider = new OpenAIProvider();

  // Repositories
  const nlqQaTopoGenAdapter = new NlqQaTopologyGenerationAdapter(
    loggerProvider,
    openAiProvider
  );
  const nlqQueryGenAdapter = new NlqQaGenerationAdapter(
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
  const genNewQuestionAndQueryFromOldStep =
    new GenNewQuestionAndQueryFromOldStep(loggerProvider, nlqQueryGenAdapter);
  // Use cases
  const useCase = new GenNewQuestionAndQueryFromOldUseCase(
    loggerProvider,
    genNewQuestionAndQueryFromOldStep
  );

  // Controllers
  const controller: IController = new GenNewQuestionQueryFromOldController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
