export interface SchemaColumnQueryFormat {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_data_type: string;
  is_primary_key: boolean | null;
  is_foreign_key: boolean | null;
  is_unique: boolean | null;
  relation_foreign_key_id: number | null; // my own
  relation_primary_key_id: number | null;
  relation_is_static: boolean | null;
  column_key_is_static: boolean[] | null;
  column_key_type: string[] | null;
}
