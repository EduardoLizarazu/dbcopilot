export interface INlqQaEntity {
  question: string;
  query: string;
  time_question: Date;
  time_query: Date;
}

export class NlqQaEntity {
  private _question: string = "";
  private _query: string = "";
  private _time_question: Date = new Date();
  private _time_query: Date = new Date();
  private _total_time: number = 0; // in seconds

  constructor() {}

  get question(): string {
    return this._question;
  }

  get query(): string {
    return this._query;
  }

  get time_question(): Date {
    return this._time_question;
  }

  get time_query(): Date {
    return this._time_query;
  }

  get total_time(): number {
    if (this.time_question && this.time_query) {
      return (
        ((this._time_query as Date).getTime() -
          (this._time_question as Date).getTime()) /
        1000
      ); // in seconds
    }
    return this._total_time;
  }

  set query(value: string) {
    this._query = value;
  }

  set time_question(value: Date) {
    this._time_question = value;
  }

  set time_query(value: Date) {
    this._time_query = value;
  }
}
