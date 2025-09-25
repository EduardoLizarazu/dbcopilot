import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateRoleController } from "@/http/controllers/role/create-role.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { FirebaseAuthService } from "../../auth.infra.service";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { CreateRoleUseCase } from "@/core/application/usecases/role/create-role.usecase";

export function createRoleComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseAdmin,
    loggerProvider
  );
  const authRepository = new AuthorizationRepository(
    loggerProvider,
    firebaseAdmin
  );

  // Use cases

  const useCase = new CreateRoleUseCase(roleRepository, loggerProvider);

  const controller: IController = new CreateRoleController(
    useCase,
    authRepository,
    loggerProvider
  );
  return controller;
}
