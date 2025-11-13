// Import or instantiate your providers as needed
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { IController } from "@/http/controllers/IController.http.controller";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { UserRepository } from "@/infrastructure/repository/user.repo";
import { ReadUserByIdUseCase } from "@/core/application/usecases/user/read-user-by-id.usecase";
import { ReadUserByIdController } from "@/http/controllers/user/read-user-by-id.http.controller";

/**
 * Composer function for creating and configuring the components required for user creation.
 *
 * @function
 * @returns {IController} The configured user creation controller.
 */

export function readUserByIdComposer(): IController {
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();
  const logger = new WinstonLoggerProvider();

  const userRepository = new UserRepository(
    logger,
    firebaseAdmin,
    firebaseClient
  );

  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(logger, firebaseAdmin);
  const authRepository = new AuthorizationRepository(logger, firebaseAdmin);

  const useCase = new ReadUserByIdUseCase(logger, userRepository);

  const controller: IController = new ReadUserByIdController(
    logger,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
