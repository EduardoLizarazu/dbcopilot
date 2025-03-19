import { IdValueObject } from "../valueObject/id.domain.valueObject";

export class AbstractEntity {
  protected readonly _id: IdValueObject;
  constructor(id: IdValueObject) {
    this._id = id;
  }
  get id(): number {
    return this._id.value;
  }
}
