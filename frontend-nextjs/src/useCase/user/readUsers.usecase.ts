import { UserRepository } from "@/data/repo/index.data.repo";
import {
  ReadUserOutput,
  ReadUserDTO,
  ReadPermissionOutput,
} from "../dto/index.usecase.dto";
import { GetRolesForUserDataModel } from "@/data/model/index.data.model";

export interface ReadUserUseCaseOutput {
  user: ReadUserOutput;
  roles: GetRolesForUserDataModel[];
  directPermissions: ReadPermissionOutput[];
}

export class ReadUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<ReadUserUseCaseOutput[]> {
    const users = await this.userRepository.getAllUsers();
    const usersDTO = ReadUserDTO.createFromList(users);
    // ReadUserDTO.toEntityFromList(usersDTO);
    const basicUserOutput = ReadUserDTO.toListOfObjects(usersDTO);

    const basicRoleOutput = users.map((user) => user.roles);
    const basicDirectPermissionOutput = users.map(
      (user) => user.directPermissions
    );

    const output = basicUserOutput.map((user, index) => {
      return {
        user,
        roles: basicRoleOutput[index],
        directPermissions: basicDirectPermissionOutput[index],
      };
    });
    console.log("ReadUsersUseCaseOutput", output);
    return output;
  }
}
