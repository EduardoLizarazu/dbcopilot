import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IController } from "@/http/controllers/IController.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { AuthorizationRepository } from "@/infrastructure/repository/auth.repo";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { ReadAllRoleUseCase } from "@/core/application/usecases/role/read-all-role.usecase";
import { ReadAllRoleController } from "@/http/controllers/role/read-all-role.http.controller";
import { ReadRoleByIdUseCase } from "@/core/application/usecases/role/read-role-by-id.app.usecase";
import { ReadRoleByIdController } from "@/http/controllers/role/read-role-by-id.http.controller";

export function readRoleByIdComposer(): IController {
  // Providers
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Repositories
  const roleRepository: IRoleRepository = new RoleInfraRepository(
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

  const useCase = new ReadRoleByIdUseCase(loggerProvider, roleRepository);

  const controller: IController = new ReadRoleByIdController(
    loggerProvider,
    useCase,
    decodeTokenAdapter,
    authRepository
  );
  return controller;
}
