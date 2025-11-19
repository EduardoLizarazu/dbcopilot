import { IController } from "@/http/controllers/IController.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaTopologyGenerationAdapter } from "@/infrastructure/adapters/nlq-qa-topology-generation";
import { GenSchemaCtxController } from "@/http/controllers/gen-topo/gen-schema-ctx.http.controller";
import { GenSchemaCtxUseCase } from "@/core/application/usecases/gen-topo/gen-schema-ctx.usecase";
import { GenSchemaCtxStep } from "@/core/application/steps/genTepology/gen-schema-ctx.step";

export function GenSchemaCtxComposer(): IController {
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
  const genSchemaCtxStep = new GenSchemaCtxStep(
    loggerProvider,
    nlqQaTopoGenAdapter
  );
  // Use cases
  const useCase = new GenSchemaCtxUseCase(loggerProvider, genSchemaCtxStep);

  // Controllers
  const controller: IController = new GenSchemaCtxController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
