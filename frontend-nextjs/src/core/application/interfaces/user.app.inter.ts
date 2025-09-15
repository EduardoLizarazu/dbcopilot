import {
  TCreateUserDto,
  TUpdateUserDto,
  TUserOutputRequestDto,
} from "../dtos/user.app.dto";

export interface IUserRepository {
  create(data: TCreateUserDto): Promise<TUserOutputRequestDto>;
  update(id: string, data: TUpdateUserDto): Promise<TUserOutputRequestDto>;
  delete(id: string): Promise<void>;
  findAll(): Promise<TUserOutputRequestDto[]>;
  findById(id: string): Promise<TUserOutputRequestDto | null>;
  findByEmail(email: string): Promise<TUserOutputRequestDto | null>;
  findByName(name: string): Promise<TUserOutputRequestDto[]>;
}
