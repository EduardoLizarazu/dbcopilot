import {
  TCreateUserDto,
  TUpdateUserDto,
  TUserOutputRequestDto,
} from "@/core/application/dtos/user.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface IUserRepository
  extends IGenericMutationRepository<
    TCreateUserDto,
    TUpdateUserDto,
    TUserOutputRequestDto
  > {
  findByEmail(email: string): Promise<TUserOutputRequestDto | null>;
  findByName(name: string): Promise<TUserOutputRequestDto[]>;
}
