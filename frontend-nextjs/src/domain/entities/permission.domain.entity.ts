import { IdValueObject } from "../valueObject/index.domain.valueObject";

class PermissionEntity {
  private readonly _id: IdValueObject;
  private readonly _name: string;
  private readonly _description: string;

  constructor(id: IdValueObject, name: string, description: string) {
    this._id = id;
    this._name = name;
    this._description = description;
  }

  get id(): number {
    return this._id.value;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }
}

export { PermissionEntity };
