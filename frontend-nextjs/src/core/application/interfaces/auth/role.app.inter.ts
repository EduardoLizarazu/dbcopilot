import {
  TCreateRoleDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "../../dtos/auth/role.app.dto";
import { IGenericMutationRepository } from "../generic.app.inter";

export interface IRoleRepository
  extends IGenericMutationRepository<
    TCreateRoleDto,
    TUpdateRoleDto,
    TRoleOutRequestDto
  > {
  findByName(name: string): Promise<TRoleOutRequestDto | null>;
}
