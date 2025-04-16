export interface ReadSqlSchemaActionOutput extends CreateSqlSchemaActionInput {
  id: number;
}

export interface CreateSqlSchemaActionInput {
  name: string;
  type: string;
  query: string;
}
