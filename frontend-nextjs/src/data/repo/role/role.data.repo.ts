import { CreateRoleDataModel } from "@/data/model/index.data.model";
import { IRoleRepository } from "./IRole.data.repo";

export class RoleRepository extends IRoleRepository {
  createRole(role: CreateRoleDataModel): void {
    console.log("RoleRepository.createRole", role);
    throw new Error("Method not implemented.");
  }
}
