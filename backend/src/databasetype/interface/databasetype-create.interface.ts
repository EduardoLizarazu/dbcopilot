export interface CreateSqlSchemaActionInput {
  name: string;
  type: string;
  query: string;
}
export interface ReadSqlSchemaActionOutput extends CreateSqlSchemaActionInput {
  id: number;
}
export interface UpdateSqlSchemaActionInput {
  name?: string;
  type?: string;
  query?: string;
}
