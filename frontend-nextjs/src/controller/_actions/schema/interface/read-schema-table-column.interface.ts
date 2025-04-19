export interface IReadSchemaData {
  table_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: {
    column_id: number;
    column_name: string;
    column_alias: string;
    column_description: string;
    column_data_type: string;
    foreign_key: number;
    primary_key: number;
    relation_description: string;
  }[];
}

export interface ISchemaTable {
  table_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
}

export interface ISchemaColumn {
  column_id: number;
  column_alias: string | null;
  column_description: string | null;
}
