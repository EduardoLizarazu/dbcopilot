import { UserEntity } from "@/domain/entities/user.domain.entity";
import { CreateUserDTO, CreateUserInput } from "../index.usecase.dto";
import {
  EmailValueObject,
  IdValueObject,
  PhoneValueObject,
} from "@/domain/valueObject/index.domain.valueObject";

export interface UpdateUserInput extends CreateUserInput {
  id: number;
}

export class UpdateUserDTO extends CreateUserDTO {
  protected readonly _id: number;

  constructor(props: UpdateUserInput) {
    super(props);
    this._id = props.id;
  }

  get id(): number {
    return this._id;
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
      id: this._id,
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
    };
  }
}
