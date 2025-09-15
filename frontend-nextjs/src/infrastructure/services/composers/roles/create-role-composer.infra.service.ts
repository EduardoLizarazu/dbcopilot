import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { CreateRoleUseCase } from "@/core/application/usecases/repositories/role/create-role.usecase.repo";
import { IController } from "@/http/controllers/IController.http.controller";
import { CreateRoleController } from "@/http/controllers/role/create-role.http.controller";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";

export function createRoleComposer(): IController {
  const firebaseClientProvider = new FirebaseClientProvider();
  const loggerProvider = new WinstonLoggerProvider();

  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseClientProvider,
    loggerProvider
  );

  const useCase = new CreateRoleUseCase(roleRepository, loggerProvider);

  const controller: IController = new CreateRoleController(
    useCase,
    loggerProvider
  );
  return controller;
}
