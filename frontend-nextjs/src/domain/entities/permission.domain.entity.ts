import { IdValueObject } from "../valueObject/index.domain.valueObject";
import { AbstractEntity } from "./abstract.domain.entity";

class PermissionEntity extends AbstractEntity {
  private readonly _name: string;
  private readonly _description: string;

  constructor(id: IdValueObject, name: string, description: string) {
    super(id);
    this._name = name;
    this._description = description;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }
}

export { PermissionEntity };
