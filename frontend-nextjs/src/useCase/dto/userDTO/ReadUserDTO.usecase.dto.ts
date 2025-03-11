import { UserEntity } from "@/domain/entities/index.domain.entity";
import {
  EmailValueObject,
  IdValueObject,
  PhoneValueObject,
} from "@/domain/valueObject/index.domain.valueObject";
import { CreateUserInput } from "@useCases/dto/index.usecase.dto";

export interface ReadUserOutput extends Omit<CreateUserInput, "password"> {
  id: number;
}

export class ReadUserDTO {
  private readonly _id: number;
  private readonly _username: string;
  private readonly _email: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _phone: string;

  constructor(props: ReadUserOutput) {
    this._id = props.id;
    this._username = props.username;
    this._email = props.email;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone;
  }

  get id(): number {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
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

  static createFromList(users: ReadUserOutput[]) {
    return users.map((user) => new ReadUserDTO(user));
  }

  static toListOfObjects(users: ReadUserDTO[]) {
    return users.map((user) => user.toObject());
  }

  static createDTO(user: ReadUserOutput | undefined) {
    return new ReadUserDTO({
      id: user?.id || 0,
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
  }

  toEntity() {
    return new UserEntity({
      id: new IdValueObject(this._id),
      username: this._username,
      email: new EmailValueObject(this._email),
      password: "", // fake
      firstName: this._firstName,
      lastName: this._lastName,
      phone: new PhoneValueObject(this._phone),
    });
  }

  static toEntityFromList(users: ReadUserDTO[]) {
    return users.map((user) => user.toEntity());
  }

  toObject(): ReadUserOutput {
    return {
      id: this._id,
      username: this._username,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
    };
  }
}
