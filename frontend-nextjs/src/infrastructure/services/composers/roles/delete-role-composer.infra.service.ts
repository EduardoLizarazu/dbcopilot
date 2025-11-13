import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleRepository } from "@/infrastructure/repository/role.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { DeleteRoleUseCaseRepo } from "@/core/application/usecases/role/delete-role.usecase";
import { DeleteRoleController } from "@/http/controllers/role/delete-role.http.controller";
import { UserRepository } from "@/infrastructure/repository/user.repo";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";

export function deleteRoleComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClientProvider = new FirebaseClientProvider();

  // Repositories
  const roleRepository: IRoleRepository = new RoleRepository(
    firebaseAdmin,
    loggerProvider
  );
  const userRepo = new UserRepository(
    loggerProvider,
    firebaseAdmin,
    firebaseClientProvider
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

  const useCase = new DeleteRoleUseCaseRepo(
    loggerProvider,
    roleRepository,
    userRepo
  );

  const controller: IController = new DeleteRoleController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
