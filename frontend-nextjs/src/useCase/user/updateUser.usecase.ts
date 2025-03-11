import { UserRepository } from "@/data/repo/index.data.repo";
import {
  ReadPermissionOutput,
  ReadRoleOutput,
  UpdateUserDTO,
  UpdateUserInput,
} from "../dto/index.usecase.dto";

export interface UpdateUserUseCaseInput {
  user: UpdateUserInput;
  role: ReadRoleOutput[];
  permission: ReadPermissionOutput[];
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserUseCaseInput): Promise<void> {
    const userDTO = new UpdateUserDTO(input.user);
    userDTO.toEntity();
    const basicUserObject = userDTO.toObject();
    const basicRolesObject = input.role;
    const basicPermissionsObject = input.permission;
    const update = {
      ...basicUserObject,
      roles: basicRolesObject,
      directPermissions: basicPermissionsObject,
    };

    await this.userRepository.updateUser(update);
  }
}
