import {
  PermissionRepository,
  RoleRepository,
} from "@data/repo/index.data.repo";
import {
  CreatePermissionUseCase,
  CreateRoleUseCase,
  ReadRolesUseCase,
  ReadPermissionUseCase,
  ReadRoleByIdUseCase,
  EditRoleUseCase,
  RemoveRoleUseCase,
  ReadPermissionByIdUseCase,
  UpdatePermissionUseCase,
  DeletePermissionByIdUseCase,
} from "@useCases/index.usecase";

// ROLE SERVICE
export const CreateRoleService = new CreateRoleUseCase(new RoleRepository());
export const GetRolesService = new ReadRolesUseCase(new RoleRepository());
export const GetRoleByIdService = new ReadRoleByIdUseCase(new RoleRepository());
export const UpdateRoleService = new EditRoleUseCase(new RoleRepository());
export const RemoveRoleService = new RemoveRoleUseCase(new RoleRepository());

// PERMISSION SERVICE
export const CreatePermissionService = new CreatePermissionUseCase(
  new PermissionRepository()
);
export const GetPermissionsService = new ReadPermissionUseCase(
  new PermissionRepository()
);
export const GetPermissionByIdService = new ReadPermissionByIdUseCase(
  new PermissionRepository()
);
export const UpdatePermissionService = new UpdatePermissionUseCase(
  new PermissionRepository()
);
export const DeletePermissionByIdService = new DeletePermissionByIdUseCase(
  new PermissionRepository()
);
