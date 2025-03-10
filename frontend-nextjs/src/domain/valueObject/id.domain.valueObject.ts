export class IdValueObject {
  private readonly _value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("ID value must be a positive integer.");
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }
}
