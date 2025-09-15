import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { IController } from "@/http/controllers/IController.http.controller";
import { UserInfraRepository } from "@/infrastructure/repository/user.infra.repo";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { IReadAllRoleAppUseCase } from "@/core/application/usecases/interfaces/role/read-all-role.app.usecase.inter";
import { ReadAllUserController } from "@/http/controllers/user/read-all-user.http.controller";
import { ReadAllUserUseCase } from "@/core/application/usecases/repositories/user/read-all-user.usecase";

export function readUserComposer(): IController {
  const firebaseAdmin = new FirebaseAdminProvider();
  const firebaseClient = new FirebaseClientProvider();

  const userRepository: IUserRepository = new UserInfraRepository(
    firebaseAdmin,
    firebaseClient
  );

  const useCase: IReadAllRoleAppUseCase = new ReadAllUserUseCase(
    userRepository
  );

  const controller: IController = new ReadAllUserController(useCase);
  return controller;
}
