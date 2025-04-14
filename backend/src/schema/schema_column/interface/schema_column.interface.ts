/**
 * {
          "column_id": 551,
          "column_technical_name": "columnIdChild",
          "column_alias": null,
          "column_data_type": "integer",
          "relation_foreign_key_id": 551,
          "relation_primary_key_id": 543,
          "relation_is_static": true,
          "column_key_is_static": true,
          "column_key_type": "pk"
        }
 */
interface SchemaColumnsQuery {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_data_type: string;
  relation_foreign_key_id: number | null;
  relation_primary_key_id: number | null;
  relation_is_static: boolean | null;
  column_key_is_static: boolean | null;
  column_key_type: string | null;
}

interface SchemaColumnQueryFormat {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_data_type: string;
  is_primary_key: boolean | null;
  is_foreign_key: boolean | null;
  is_unique: boolean | null;
  relation_foreign_key_id: number | null;
  relation_primary_key_id: number | null;
  relation_is_static: boolean | null;
  column_key_is_static: boolean | null;
  column_key_type: string | null;
}

// If the column id is repeated it sometimes where it has multiple key types.
// So we need to remove the duplicates and add the key types to the column_key_type array.
export const schemaColumnQueryFormat = (
  schemaColumns: SchemaColumnsQuery[],
): SchemaColumnQueryFormat[] => {
  const schemaColumnFormatted: SchemaColumnQueryFormat[] = schemaColumns.map(
    (column) => {
      return {
        column_id: column.column_id,
        column_technical_name: column.column_technical_name,
        column_alias: column.column_alias,
        column_data_type: column.column_data_type,
        is_primary_key: null,
        is_foreign_key: null,
        is_unique: null,
        relation_foreign_key_id: column.relation_foreign_key_id,
        relation_primary_key_id: column.relation_primary_key_id,
        relation_is_static: column.relation_is_static,
        column_key_is_static: column.column_key_is_static,
        column_key_type: column.column_key_type,
      };
    },
  );
  // taking care of the ids=

  return schemaColumnFormatted;
};
