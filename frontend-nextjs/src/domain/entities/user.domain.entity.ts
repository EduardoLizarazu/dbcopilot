import { IdValueObject } from "../valueObject/id.domain.valueObject";
import {
  EmailValueObject,
  PhoneValueObject,
} from "../valueObject/index.domain.valueObject";

interface UserProps {
  id: IdValueObject;
  username: string;
  email: EmailValueObject;
  password: string;
  firstName: string;
  lastName: string;
  phone: PhoneValueObject;
}

export class UserEntity {
  private readonly _id: IdValueObject;
  private readonly _username: string;
  private readonly _email: EmailValueObject;
  private readonly _password: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _phone: PhoneValueObject;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone;
  }

  get id(): IdValueObject {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): EmailValueObject {
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

  get phone(): PhoneValueObject {
    return this._phone;
  }
}
