import {
  TCreateRoleDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "../dtos/role.app.dto";

export interface IRoleRepository {
  create(data: TCreateRoleDto): Promise<TRoleOutRequestDto>;
  update(id: string, data: TUpdateRoleDto): Promise<TRoleOutRequestDto>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TRoleOutRequestDto | null>;
  findAll(): Promise<TRoleOutRequestDto[]>;
  findByName(name: string): Promise<TRoleOutRequestDto | null>;
}
