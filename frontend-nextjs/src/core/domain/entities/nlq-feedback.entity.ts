export interface INlqFeedbackEntity {
  explication: string;
  type: 0 | 1; // 0: negative, 1: positive
  date_feedback: Date;
}

export class NlqFeedbackEntity {
  private _explication: string = "";
  private _type: 0 | 1 = 1;
  private _date_feedback: Date = new Date();

  constructor() {}
  //   Getters and Setters
  get explication(): string {
    return this._explication;
  }
  get type(): 0 | 1 {
    return this._type;
  }
  get date_feedback(): Date {
    return this._date_feedback;
  }

  set explication(value: string) {
    this._explication = value;
    if (value.length > 0) {
      this.type = 0; // negative feedback
    } else {
      this.type = 1; // positive feedback
    }
  }
  set type(value: 0 | 1) {
    this._type = value;
    if (value === 1) {
      this._explication = "";
    }
  }
  set date_feedback(value: Date) {
    this._date_feedback = value;
  }
}
