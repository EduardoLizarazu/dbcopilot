export class EmailValueObject {
    private readonly _value: string;

    constructor(value: string) {
        // Validate Email format
        if(!this.isValid()) {
            throw new Error("Email is not valid");
        }
        this._value = value;

    }

    get value(): string {
        return this._value
    }

    isValid(): boolean {
        return (this.isString() && this.isEmail());
    }

    isString(): boolean {
        if (typeof this.value === "string") {
            return true;
        } else {
            throw new Error("Value is not a string");
        }
    }

    isEmail(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if(emailRegex.test(this.value)) {
            return true;
        } else {
            throw new Error("Email is not valid");
        }
    }
}