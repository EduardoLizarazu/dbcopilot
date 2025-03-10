export class PhoneValueObject {
    private readonly _value: string;

    constructor(value: string) {
        // Validate Phone format
        if(!this.isValid()) {
            throw new Error("Phone is not valid");
        }
        this._value = value;

    }

    get value(): string {
        return this._value
    }

    isValid(): boolean {
        return (this.isString() && this.isPhone());
    }

    isString(): boolean {
        if (typeof this.value === "string") {
            return true;
        } else {
            throw new Error("Value is not a string");
        }
    }

    isPhone(): boolean {
        const phoneRegex = /^[0-9]{10}$/; 
        if(phoneRegex.test(this.value)) {
            return true;
        } else {
            throw new Error("Phone is not valid");
        }
    }
}