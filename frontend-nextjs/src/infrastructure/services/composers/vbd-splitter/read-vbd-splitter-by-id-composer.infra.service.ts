import { ReadVbdSplitterByIdUseCase } from "@/core/application/usecases/vbd-splitter/read-vbd-splitter-by-id.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { ReadVbdSplitterByIdController } from "@/http/controllers/vbd-splitter/read-vbd-splitter-by-id.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { VbdSplitterRepository } from "@/infrastructure/repository/vbd-splitter.repo";

export function ReadVbdSplitterByIdComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // REPOSITORIES
  const vbdSplitterRepo = new VbdSplitterRepository(
    loggerProvider,
    firebaseAdmin
  );

  // Others utils
  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );

  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // USE CASES
  const useCase = new ReadVbdSplitterByIdUseCase(
    loggerProvider,
    vbdSplitterRepo
  );

  // CONTROLLER
  const controller = new ReadVbdSplitterByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
