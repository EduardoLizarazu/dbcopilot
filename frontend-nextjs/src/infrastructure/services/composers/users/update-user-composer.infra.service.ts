import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { IUpdateUserAppUseCase } from "@/core/application/usecases/user/update-user.app.usecase";
import { UpdateUserUseCase } from "@/core/application/usecases/repositories/user/update-user.usecase";
import { IController } from "@/http/controllers/IController.http.controller";
import { UpdateUserController } from "@/http/controllers/user/update-user.http.controller";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { RoleInfraRepository } from "@/infrastructure/repository/role.infra.repo";
import { UserInfraRepository } from "@/infrastructure/repository/user.infra.repo";

export function updateUserComposer(): IController {
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();

  const userRepository: IUserRepository = new UserInfraRepository(
    firebaseAdmin,
    firebaseClient
  );

  const roleRepository: IRoleRepository = new RoleInfraRepository(
    firebaseClient
  );
  const useCase: IUpdateUserAppUseCase = new UpdateUserUseCase(
    userRepository,
    roleRepository
  );

  const controller: IController = new UpdateUserController(useCase);
  return controller;
}
