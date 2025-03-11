export class PhoneValueObject {
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    // Validate Phone format
    if (!this.isValid()) {
      throw new Error("Phone is not valid");
    }
  }

  get value(): string {
    return this._value;
  }

  isValid(): boolean {
    return this.isString();
  }

  isString(): boolean {
    if (typeof this._value === "string") {
      return true;
    } else {
      throw new Error("Value is not a string, but: " + typeof this._value);
    }
  }
}
