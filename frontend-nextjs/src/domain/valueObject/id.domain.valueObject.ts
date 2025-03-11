export class IdValueObject {
  private readonly _value: number;

  constructor(value: number) {
    this._value = value;
    this.isValid();
  }

  get value(): number {
    return this._value;
  }

  isValid() {
    this.isInteger();
    this.isGreaterThanZero();
    return true;
  }

  isInteger() {
    if (!Number.isInteger(this._value)) {
      throw new Error("ID value must be an integer: " + this._value);
    }
    return true;
  }

  isGreaterThanZero() {
    if (this._value <= 0) {
      throw new Error("ID value must be greater than zero: " + this._value);
    }
    return true;
  }
}
