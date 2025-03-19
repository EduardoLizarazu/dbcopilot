import { IdValueObject } from "../valueObject/index.domain.valueObject";
import { AbstractEntity } from "./abstract.domain.entity";

class RoleEntity extends AbstractEntity {
  private readonly _name: string;

  constructor(id: IdValueObject, name: string) {
    super(id);
    this._name = name;
  }

  get name(): string {
    return this._name;
  }
}

export { RoleEntity };
