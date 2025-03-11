export class EmailValueObject {
  private readonly _value: string;

  constructor(value: string) {
    // Validate Email format
    this._value = value;
    if (!this.isValid()) throw new Error("Email is not valid");
  }

  get value(): string {
    return this._value;
  }

  isValid(): boolean {
    return this.isString() && this.isEmail();
  }

  isString(): boolean {
    if (typeof this._value === "string") {
      return true;
    } else {
      throw new Error("Value is not a string, but type: " + typeof this._value);
    }
  }

  isEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(this._value)) {
      return true;
    } else {
      throw new Error("Email is not valid");
    }
  }
}
