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
  createdAt: Date;
}

export class UserEntity {
  private readonly _id: IdValueObject;
  private readonly _username: string;
  private readonly _email: EmailValueObject;
  private readonly _password: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _phone: PhoneValueObject;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone;
    this._createdAt = props.createdAt;
  }
}
