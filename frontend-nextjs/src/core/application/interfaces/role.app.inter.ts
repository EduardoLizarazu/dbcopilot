import {
  TCreateRoleDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "../dtos/role.app.dto";

export interface IRoleRepository {
  create(data: TCreateRoleDto): Promise<string>;
  update(id: string, data: TUpdateRoleDto): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TRoleOutRequestDto | null>;
  findAll(): Promise<TRoleOutRequestDto[]>;
  findByName(name: string): Promise<TRoleOutRequestDto | null>;
}
