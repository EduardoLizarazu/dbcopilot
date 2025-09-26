// Import or instantiate your providers as needed
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { IController } from "@/http/controllers/IController.http.controller";
import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { CreateUserController } from "@/http/controllers/user/create-user.http.controller";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { UserRepository } from "@/infrastructure/repository/user.repo";
import { RoleRepository } from "@/infrastructure/repository/role.repo";
import { CreateUserUseCase } from "@/core/application/usecases/user/create-user.usecase";

/**
 * Composer function for creating and configuring the components required for user creation.
 *
 * @function
 * @returns {IController} The configured user creation controller.
 */

export function createUserComposer(): IController {
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();
  const logger = new WinstonLoggerProvider();

  const userRepository = new UserRepository(
    logger,
    firebaseAdmin,
    firebaseClient
  );

  const roleRepository = new RoleRepository(firebaseAdmin, logger);

  // Other repositories
  const decodeTokenAdapter = new DecodeTokenAdapter(logger, firebaseAdmin);
  const authRepository = new AuthorizationRepository(logger, firebaseAdmin);

  const useCase = new CreateUserUseCase(logger, userRepository, roleRepository);

  const controller: IController = new CreateUserController(
    logger,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
