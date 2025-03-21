import { UserRepository } from "@/data/repo/index.data.repo";
import { ReadUserUseCaseOutput } from "./readUsers.usecase";
import {
  ReadPermissionActivationDTO,
  ReadPermissionDTO,
  ReadRoleDTO,
  ReadUserDTO,
} from "../dto/index.usecase.dto";

export class ReadUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<ReadUserUseCaseOutput> {
    const user = await this.userRepository.getUserById(id);

    // extract the id of the roles and permissions
    const idOfRolesAndRolesPermissions = user?.roles.map((role) => {
      return {
        roleId: role.id,
        permissions: role.permissions.map((permission) => permission.id),
      };
    });

    // DTO
    const userDTO = ReadUserDTO.createDTO(user);
    const roleDTO = ReadRoleDTO.createDTOFromList(user?.roles || []);
    const directPermissionsDTO = ReadPermissionDTO.toDTOFromObjectList(
      user?.directPermissions || []
    );

    const roles = user?.roles || [];

    const permissionOfRole = roles.map((role) => role.permissions).flat();
    const permissionOfRoleDTO =
      ReadPermissionActivationDTO.fromListToDTOList(permissionOfRole);

    // ENTITY
    userDTO.toEntity();
    ReadRoleDTO.createEntityFromListOfDTO(roleDTO);
    ReadPermissionDTO.fromDTOListToEntityList(directPermissionsDTO);
    ReadPermissionActivationDTO.fromDTOListToEntityList(permissionOfRoleDTO);

    // OUTPUT
    const userOutput = userDTO.toObject();
    const rolesObject = ReadRoleDTO.toObjectListFromDTO(roleDTO);
    const directPermissionsOutput =
      ReadPermissionDTO.fromDTOtoListOfObject(directPermissionsDTO);
    const permissionOfRoleObject =
      ReadPermissionActivationDTO.fromDTOtoList(permissionOfRoleDTO);

    // Union of rolesObject and role's permissionOfRoleObject in a single object (output) with idOfRolesAndRolesPermissions
    const rolesOutput = rolesObject.map((role) => {
      const rolePermissions = idOfRolesAndRolesPermissions?.find(
        (item) => item.roleId === role.id
      );
      return {
        ...role,
        permissions: permissionOfRoleObject.filter((permission) =>
          rolePermissions?.permissions.includes(permission.id)
        ),
      };
    });

    const output = {
      user: userOutput,
      roles: rolesOutput,
      directPermissions: directPermissionsOutput,
    };
    return output;
  }
}
