import { ToggleNlqQaIgnoreStep } from "@/core/application/steps/nlq-qa/toggle-nlq-qa-ignore.step";
import { ToggleNlqQaIgnoreUseCase } from "@/core/application/usecases/nlq/nlq-qa/toggle-nlq-qa-ignore.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ToggleNlqQaIgnoreController } from "@/http/controllers/nlq-qa/toggle-nlq-qa-ignore.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

export function ToggleNlqQaIgnoreComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);

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
  const toggleNlqQaIgnoreStep = new ToggleNlqQaIgnoreStep(
    loggerProvider,
    nlqQaRepository
  );

  // Use cases
  const toggleNlqQaIgnoreUseCase = new ToggleNlqQaIgnoreUseCase(
    loggerProvider,
    toggleNlqQaIgnoreStep
  );

  // Controllers
  const controller: IController = new ToggleNlqQaIgnoreController(
    loggerProvider,
    toggleNlqQaIgnoreUseCase,
    decodeTokenAdapter,
    authRepository
  );

  return controller;
}
