import { UserRepository } from "@/data/repo/index.data.repo";
import {
  ReadPermissionOutput,
  ReadRoleOutput,
  CreateUserDTO,
  CreateUserInput,
  UpdatePermissionActivationInput,
  ReadRoleDTO,
  UpdatePermissionActivationDTO,
  ReadPermissionDTO,
} from "../dto/index.usecase.dto";
import { CreateUserDataModel } from "@/data/model/index.data.model";

export interface CreateUserUseCaseInput {
  user: CreateUserInput;
  role: ReadRoleOutput[];
  rolePermission: (UpdatePermissionActivationInput & { roleId: number })[];
  permission: ReadPermissionOutput[];
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserUseCaseInput): Promise<void> {
    // DTO
    const userDTO = new CreateUserDTO(input.user);
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
    const userCmd = userDTO.toObject();
    const onlyRoleCmd = ReadRoleDTO.toObjectListFromDTO(roleDTO);
    const directPermissionCmd =
      ReadPermissionDTO.fromDTOtoListOfObject(directPermissionDTO);
    const onlyRolePermissionCmd =
      UpdatePermissionActivationDTO.toObjectList(rolePermissionDTOs);

    // Union of onlyRoleCommand and onlyRolePermissionCommand in a single object (output)
    // With rolePermission where the IDs are the same
    const joinRolePermissionCmd = input.rolePermission.map((item) => {
      const role = onlyRoleCmd.find((role) => role.id === item.roleId) || {
        id: 0,
        name: "",
      };
      return {
        ...role,
        permissions: onlyRolePermissionCmd.filter(
          (permission) => item.id === permission.id
        ),
      };
    });

    const command: CreateUserDataModel = {
      ...userCmd,
      roles: joinRolePermissionCmd,
      directPermissions: directPermissionCmd,
    };

    await this.userRepository.createUser(command);
  }
}
