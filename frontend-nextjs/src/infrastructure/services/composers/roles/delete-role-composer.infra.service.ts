import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { UpdateRoleUseCaseRepo } from "@/core/application/usecases/role/update-role.usecase";
import { UpdateRoleController } from "@/http/controllers/role/update-role.http.controller";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { DeleteRoleUseCaseRepo } from "@/core/application/usecases/role/delete-role.usecase";
import { DeleteRoleController } from "@/http/controllers/role/delete-role.http.controller";
import { UserInfraRepository } from "@/infrastructure/repository/user.infra.repo";

export function deleteRoleComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseAdmin,
    loggerProvider
  );
  const userRepo = new UserInfraRepository(firebaseAdmin, loggerProvider);

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

  const useCase = new DeleteRoleUseCaseRepo(loggerProvider, roleRepository);

  const controller: IController = new DeleteRoleController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
