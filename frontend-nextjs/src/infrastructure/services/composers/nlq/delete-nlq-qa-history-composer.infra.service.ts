import { RemoveNlqQaRefOnNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/remove-nlq-qa-ref-on-nlq-qa-good.step";
import { DeleteNlqQaHistoryByIdStep } from "@/core/application/steps/nlq-qa/delete-nlq-qa-history-by-id.step";
import { DeleteNlqQaHistoryByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa/delete-nlq-qa-history-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { DeleteNlqQaHistoryByIdController } from "@/http/controllers/nlq-qa/delete-nlq-qa-history-by-id.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaGoodRepository } from "@/infrastructure/repository/nlq/nlq-qa-good.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function deleteNlqQaHistoryByIdComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);
  const nlqQaGoodRepository = new NlqQaGoodRepository(
    loggerProvider,
    firebaseAdmin
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

  //   STEPS
  const deleteNlqQaHistoryByIdStep = new DeleteNlqQaHistoryByIdStep(
    loggerProvider,
    nlqQaRepository
  );
  const removeNlqQaRefOnNlqQaGoodStep = new RemoveNlqQaRefOnNlqQaGoodStep(
    loggerProvider,
    nlqQaGoodRepository
  );

  // Use cases
  const deleteNlqQaHistoryByIdUseCase = new DeleteNlqQaHistoryByIdUseCase(
    loggerProvider,
    deleteNlqQaHistoryByIdStep,
    removeNlqQaRefOnNlqQaGoodStep
  );

  // Controllers
  const controller: IController = new DeleteNlqQaHistoryByIdController(
    loggerProvider,
    deleteNlqQaHistoryByIdUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
