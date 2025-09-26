import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleRepository } from "@/infrastructure/repository/role.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { UpdateRoleUseCaseRepo } from "@/core/application/usecases/role/update-role.usecase";
import { UpdateRoleController } from "@/http/controllers/role/update-role.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";

export function updateRoleComposer(): IController {
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

  const useCase = new UpdateRoleUseCaseRepo(loggerProvider, roleRepository);

  const controller: IController = new UpdateRoleController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
