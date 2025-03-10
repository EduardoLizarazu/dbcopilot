import {
  PermissionRepository,
  RoleRepository,
} from "@data/repo/index.data.repo";
import {
  CreatePermissionUseCase,
  CreateRoleUseCase,
  ReadRolesUseCase,
  ReadPermissionUseCase,
} from "@useCases/index.usecase";

// ROLE SERVICE
export const CreateRoleService = new CreateRoleUseCase(new RoleRepository());
export const GetRolesService = new ReadRolesUseCase(new RoleRepository());

// PERMISSION SERVICE
export const CreatePermissionService = new CreatePermissionUseCase(
  new PermissionRepository()
);
export const GetPermissionsService = new ReadPermissionUseCase(
  new PermissionRepository()
);
