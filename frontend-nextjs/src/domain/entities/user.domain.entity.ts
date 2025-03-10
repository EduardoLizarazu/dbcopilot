import { IdValueObject } from "../valueObject/id.domain.valueObject";
import { EmailValueObject, PhoneValueObject } from "../valueObject/index.domain.valueObject";

export class UserEntity {
    private readonly _id: IdValueObject;
    private readonly _username: string;
    private readonly _email: EmailValueObject;
    private readonly _password: string;
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _phone: PhoneValueObject;
    private readonly _createdAt: Date;

    constructor(
        id: IdValueObject,
        username: string,
        email: EmailValueObject,
        password: string,
        firstName: string,
        lastName: string,
        phone: PhoneValueObject,
        createdAt: Date
    ) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._password = password;
        this._firstName = firstName;
        this._lastName = lastName;
        this._phone = phone;
        this._createdAt = createdAt;
    }
}