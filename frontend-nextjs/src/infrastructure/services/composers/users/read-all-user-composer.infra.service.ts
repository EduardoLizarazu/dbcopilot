import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { IController } from "@/http/controllers/IController.http.controller";
import { UserInfraRepository } from "@/infrastructure/repository/user.repo";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { ReadAllUserController } from "@/http/controllers/user/read-all-user.http.controller";
import { ReadAllUserUseCase } from "@/core/application/usecases/user/read-all-user.usecase";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";

export function readUserComposer(): IController {
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();
  const logger = new WinstonLoggerProvider();

  const userRepository = new UserInfraRepository(
    logger,
    firebaseAdmin,
    firebaseClient
  );

  const useCase = new ReadAllUserUseCase(logger, userRepository);

  const controller: IController = new ReadAllUserController(useCase);
  return controller;
}
