import {
  TCreateUserDto,
  TUpdateUserDto,
  TUserOutputRequestDto,
  TUserOutRequestWithRoles,
} from "@/core/application/dtos/user.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface IUserRepository
  extends IGenericMutationRepository<
    TCreateUserDto,
    TUpdateUserDto,
    TUserOutputRequestDto
  > {
  findByEmail(email: string): Promise<TUserOutputRequestDto | null>;
  findAllWithRoles(): Promise<TUserOutRequestWithRoles[]>;
  findAllByEmail(email: string): Promise<TUserOutputRequestDto[]>;
  findByName(name: string): Promise<TUserOutputRequestDto[]>;
  findByRoleId(roleId: string): Promise<TUserOutputRequestDto[]>;
}
