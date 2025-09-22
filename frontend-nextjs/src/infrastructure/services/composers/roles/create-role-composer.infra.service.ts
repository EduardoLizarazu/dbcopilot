import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { CreateRoleUseCase } from "@/core/application/usecases/repositories/role/create-role.usecase.repo";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateRoleController } from "@/http/controllers/role/create-role.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { FirebaseAuthService } from "../../auth.infra.service";
import { ReadRoleByNameRoleUseCase } from "@/core/application/usecases/repositories/role/read-role-by-name.usecase.repo";
import { ReadRoleByIdUseCase } from "@/core/application/usecases/repositories/role/read-role-by-id.usecase.repo";

export function createRoleComposer(): IController {
  // Providers
  const firebaseClientProvider = new FirebaseClientProvider();
  const loggerProvider = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();

  // Services
  const firebaseAuthService = new FirebaseAuthService(
    firebaseAdmin,
    loggerProvider
  );

  // Repositories
  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseClientProvider,
    loggerProvider
  );

  // Use cases
  const readRoleByNameUseCase = new ReadRoleByNameRoleUseCase(
    roleRepository,
    loggerProvider
  );
  const readRoleByIdUseCase = new ReadRoleByIdUseCase(
    roleRepository,
    loggerProvider
  );

  const useCase = new CreateRoleUseCase(
    readRoleByNameUseCase,
    readRoleByIdUseCase,
    roleRepository,
    loggerProvider
  );

  const controller: IController = new CreateRoleController(
    useCase,
    firebaseAuthService,
    loggerProvider
  );
  return controller;
}
