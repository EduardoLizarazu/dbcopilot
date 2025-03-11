import { UserRepository } from "@/data/repo/index.data.repo";
import {
  CreateUserDTO,
  CreateUserInput,
} from "../dto/userDTO/CreateUserDTO.usecase.dto";
import { ReadPermissionOutput, ReadRoleOutput } from "../dto/index.usecase.dto";

interface CreateUserUseCaseInput {
  user: CreateUserInput;
  role: ReadRoleOutput[];
  permission: ReadPermissionOutput[];
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserUseCaseInput): Promise<void> {
    const userDTO = new CreateUserDTO(input.user);
    userDTO.toEntity();
    const basicUserObject = userDTO.toObject();

    const userObject = {
      ...basicUserObject,
      roles: input.role,
      directPermissions: input.permission,
    };

    await this.userRepository.createUser(userObject);
  }
}
