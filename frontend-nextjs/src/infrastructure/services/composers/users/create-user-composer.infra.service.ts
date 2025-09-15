// Import or instantiate your providers as needed
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { ICreateUserAppUseCase } from "@/core/application/usecases/interfaces/user/create-user.app.usecase.inter";
import { CreateUserAppUseCase } from "@/core/application/usecases/repositories/user/create-user.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { UserInfraRepository } from "@/infrastructure/repository/user.infra.repo";
import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { CreateUserController } from "@/http/controllers/user/create-user.http.controller";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { FirebaseAuthService } from "../../auth.infra.service";

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

  const userRepository: IUserRepository = new UserInfraRepository(
    firebaseAdmin,
    firebaseClient
  );

  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseClient,
    logger
  );
  const useCase: ICreateUserAppUseCase = new CreateUserAppUseCase(
    userRepository,
    roleRepository
  );

  const controller: IController = new CreateUserController(useCase);
  return controller;
}
