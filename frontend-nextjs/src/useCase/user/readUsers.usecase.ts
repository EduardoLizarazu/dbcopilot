import { UserRepository } from "@/data/repo/index.data.repo";
import {
  ReadUserOutput,
  ReadUserDTO,
  ReadRoleOutput,
  ReadPermissionOutput,
} from "../dto/index.usecase.dto";

interface output {
  user: ReadUserOutput;
  roles: ReadRoleOutput[];
  directPermissions: ReadPermissionOutput[];
}

export class ReadUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<output[]> {
    const users = await this.userRepository.getAllUsers();
    const usersDTO = ReadUserDTO.createFromList(users);
    ReadUserDTO.toEntityFromList(usersDTO);
    const basicUserOutput = ReadUserDTO.toListOfObjects(usersDTO);

    const basicRoleOutput = users.map((user) => user.roles);
    const basicDirectPermissionOutput = users.map(
      (user) => user.directPermissions
    );

    const output = basicUserOutput.map((user, index) => {
      return {
        user: user,
        roles: basicRoleOutput[index],
        directPermissions: basicDirectPermissionOutput[index],
      };
    });

    return output;
  }
}
