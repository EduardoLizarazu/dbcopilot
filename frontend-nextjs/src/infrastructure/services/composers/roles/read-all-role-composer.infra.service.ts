import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleRepository } from "@/infrastructure/repository/role.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { ReadAllRoleUseCase } from "@/core/application/usecases/role/read-all-role.usecase";
import { ReadAllRoleController } from "@/http/controllers/role/read-all-role.http.controller";

export function readAllRoleComposer(): IController {
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

  const useCase = new ReadAllRoleUseCase(loggerProvider, roleRepository);

  const controller: IController = new ReadAllRoleController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
