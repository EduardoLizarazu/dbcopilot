import { UserRepository } from "@/data/repo/index.data.repo";
import {
  ReadPermissionDTO,
  ReadPermissionOutput,
  ReadRoleDTO,
  ReadRoleOutput,
  UpdateUserDTO,
  UpdateUserInput,
  UpdatePermissionActivationDTO,
  UpdatePermissionActivationInput,
} from "../dto/index.usecase.dto";
import { UpdateUserDataModel } from "@/data/model/index.data.model";

export interface UpdateUserUseCaseInput {
  user: UpdateUserInput;
  role: ReadRoleOutput[];
  rolePermission: (UpdatePermissionActivationInput & { roleId: number })[];
  permission: ReadPermissionOutput[];
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserUseCaseInput): Promise<void> {
    // DTO
    const userDTO = new UpdateUserDTO(input.user);
    const roleDTO = ReadRoleDTO.createDTOFromList(input.role);
    const directPermissionDTO = ReadPermissionDTO.toDTOFromObjectList(
      input.permission
    );
    const rolePermissionDTOs = input.rolePermission.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { roleId, ...rest } = item; // not roleId in the DTO
      return new UpdatePermissionActivationDTO(rest);
    });

    // ENTITY
    userDTO.toEntity();
    ReadRoleDTO.createEntityFromListOfDTO(roleDTO);
    ReadPermissionDTO.fromDTOListToEntityList(directPermissionDTO);
    UpdatePermissionActivationDTO.toEntityListFromDTOList(rolePermissionDTOs);

    // COMMAND
    const userCommand = userDTO.toObject();
    const onlyRoleCommand = ReadRoleDTO.toObjectListFromDTO(roleDTO);
    const directPermissionCommand =
      ReadPermissionDTO.fromDTOtoListOfObject(directPermissionDTO);
    const onlyRolePermissionCommand =
      UpdatePermissionActivationDTO.toObjectList(rolePermissionDTOs);

    // Union of onlyRoleCommand and onlyRolePermissionCommand in a single object (output)
    // With rolePermission where the IDs are the same
    const joinRolePermissionCommand = input.rolePermission.map((item) => {
      const role = onlyRoleCommand.find((role) => role.id === item.roleId) || {
        id: 0,
        name: "",
      };
      return {
        ...role,
        permissions: onlyRolePermissionCommand.filter(
          (permission) => item.id === permission.id
        ),
      };
    });

    const update: UpdateUserDataModel = {
      id: userCommand.id,
      username: userCommand.username,
      email: userCommand.email,
      password: userCommand.password,
      firstName: userCommand.firstName,
      lastName: userCommand.lastName,
      phone: userCommand.phone,
      roles: joinRolePermissionCommand,
      directPermissions: directPermissionCommand,
    };

    await this.userRepository.updateUser(update);
  }
}
