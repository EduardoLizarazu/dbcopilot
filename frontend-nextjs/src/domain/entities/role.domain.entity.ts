import { IdValueObject } from "../valueObject/index.domain.valueObject";

class RoleEntity {
  private readonly _id: IdValueObject;
  private readonly _name: string;

  constructor(id: IdValueObject, name: string) {
    this._id = id;
    this._name = name;
  }

  get id(): number {
    return this._id.value;
  }

  get name(): string {
    return this._name;
  }
}

export { RoleEntity };
