import {
  TCreateUserDto,
  TUpdateUserDto,
} from "../../application/dtos/auth/user.app.dto";

export interface IUserEntity {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export class UserEntity {
  private _name: string;
  private _lastname: string;
  private _email: string;
  private _password: string;

  constructor(props: IUserEntity) {
    this._name = props.name;
    this._lastname = props.lastname;
    this._email = props.email;
    this._password = props.password;
  }

  static create(dto: TCreateUserDto): UserEntity {
    const { name, email, password, lastname } = dto;
    return new UserEntity({ name, email, password, lastname });
  }

  static update(dto: TUpdateUserDto): UserEntity {
    return new UserEntity({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      lastname: dto.lastname,
    });
  }

  get lastname(): string {
    return this._lastname;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }
}
