import { ToggleNlqQaFeedbackOrchestrator } from "@/core/application/orquestrator/toggle-nlq-qa-feedback.orquestator";
import { CreateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase";
import { DeleteNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/delete-nlq-qa-feedback.usecase";
import { UpdateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/update-nlq-qa-feedback.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateNlqQaFeedbackController } from "@/http/controllers/nlq-qa-feedback/create-nlq-qa-feedback.http.controller";
import { ToggleNlqQaFeedbackController } from "@/http/controllers/nlq-qa-feedback/toggle-nlq-qa-feeback.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { NlqQaFeedbackRepository } from "@/infrastructure/repository/nlq/nlq-qa-feedback.repo";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";
import { ReturnCreateNlqQaGoodUseCase } from "../nlq-qa-good/create-nlq-qa-good-composer.infra.service";
import { ReturnDeleteNlqQaGoodUseCase } from "../nlq-qa-good/delete-nlq-qa-good-composer.infra.service";
import { ReturnReadNlqQaGoodByIdUseCase } from "../nlq-qa-good/read-nlq-qa-good-by-id-composer.infra.service";
import { ReturnReadNlqQaByIdUseCase } from "../nlq/read-nlq-qa-by-id-composer.infra.service";

export function ToggleNlqQaFeedbackComposer(): IController {
  // PROVIDERS
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  //   REPOSITORIES
  const nlqQaFeedbackRepository = new NlqQaFeedbackRepository(
    loggerProvider,
    firebaseAdmin
  );
  const nlqQaRepository = new NlqQaAppRepository(loggerProvider, firebaseAdmin);

  const decodeTokenAdapter = new DecodeTokenAdapter(
    loggerProvider,
    firebaseAdmin
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  //   USE CASES
  const createUseCase = new CreateNlqQaFeedbackUseCase(
    loggerProvider,
    nlqQaFeedbackRepository,
    nlqQaRepository
  );

  const updateUseCase = new UpdateNlqQaFeedbackUseCase(
    loggerProvider,
    nlqQaFeedbackRepository,
    nlqQaRepository
  );

  const deleteUseCase = new DeleteNlqQaFeedbackUseCase(
    loggerProvider,
    nlqQaFeedbackRepository,
    nlqQaRepository
  );
  const readNlqQaByIdUseCase = ReturnReadNlqQaByIdUseCase();
  const readNlqQaGoodByIdUseCase = ReturnReadNlqQaGoodByIdUseCase();
  const createNlqQaGoodUseCase = ReturnCreateNlqQaGoodUseCase();
  const deleteNlqQaGoodUseCase = ReturnDeleteNlqQaGoodUseCase();

  //   ORCHESTRATOR
  const orchestrator = new ToggleNlqQaFeedbackOrchestrator(
    loggerProvider,
    createUseCase,
    updateUseCase,
    deleteUseCase,
    readNlqQaByIdUseCase,
    readNlqQaGoodByIdUseCase,
    createNlqQaGoodUseCase,
    deleteNlqQaGoodUseCase
  );

  //   CONTROLLER
  const controller: IController = new ToggleNlqQaFeedbackController(
    loggerProvider,
    orchestrator,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
