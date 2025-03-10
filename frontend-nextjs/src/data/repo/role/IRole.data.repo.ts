import {
  CreateRoleDataModel,
  EditRoleDataModel,
  GetRolesDataModel,
} from "@/data/model/index.data.model";

export abstract class IRoleRepository {
  abstract createRole(role: CreateRoleDataModel): Promise<void>;
  abstract getAllRoles(): Promise<GetRolesDataModel[]>;
  abstract getRoleById(id: number): Promise<GetRolesDataModel | undefined>;
  abstract updateRole(role: EditRoleDataModel): Promise<boolean>;
  abstract deleteRole(id: number): Promise<boolean>;
}
