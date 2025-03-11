import { UserEntity } from "@/domain/entities/user.domain.entity";
import {
  IdValueObject,
  PhoneValueObject,
  EmailValueObject,
} from "@/domain/valueObject/index.domain.valueObject";

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export class CreateUserDTO {
  protected readonly _username: string;
  protected readonly _email: string;
  protected readonly _password: string;
  protected readonly _firstName: string;
  protected readonly _lastName: string;
  protected readonly _phone: string;

  constructor(props: CreateUserInput) {
    this._username = props.username;
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get phone(): string {
    return this._phone;
  }

  toEntity(): UserEntity {
    return new UserEntity({
      id: new IdValueObject(1), // fake
      username: this._username,
      email: new EmailValueObject(this._email),
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: new PhoneValueObject(this._phone),
    });
  }

  toObject() {
    return {
      username: this._username,
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
    };
  }
}
