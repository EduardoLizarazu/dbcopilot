import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateRoleController } from "@/http/controllers/role/create-role.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleRepository } from "@/infrastructure/repository/role.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { CreateRoleUseCase } from "@/core/application/usecases/role/create-role.usecase";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";

export function createRoleComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const roleRepository: IRoleRepository = new RoleRepository(
    firebaseAdmin,
    loggerProvider
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

  // Use cases

  const useCase = new CreateRoleUseCase(roleRepository, loggerProvider);

  const controller: IController = new CreateRoleController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
