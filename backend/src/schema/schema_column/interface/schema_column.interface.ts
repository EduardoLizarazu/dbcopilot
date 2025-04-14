import { entityKeyType } from '../entities/schema_column_key.entity';

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
export interface SchemaColumnsQuery {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_data_type: string;
  column_description: string | null;
  relation_foreign_key_id: number | null;
  relation_primary_key_id: number | null;
  relation_is_static: boolean | null;
  column_key_is_static: boolean | null;
  column_key_type: string | null;
}

export interface SchemaColumnQueryFormat {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_data_type: string;
  column_description: string | null;
  is_primary_key: boolean | null;
  is_foreign_key: boolean | null;
  is_unique: boolean | null;
  relation_foreign_key_id: number | null; // my own
  relation_primary_key_id: number | null;
  relation_is_static: boolean | null;
  column_key_is_static: boolean[] | null;
  column_key_type: string[] | null;
}

// If the column id is repeated it sometimes where it has multiple key types.
// So we need to remove the duplicates and add the key types to the column_key_type array.
export function formatSchemaColumns(
  schemaColumns: SchemaColumnsQuery[],
): SchemaColumnQueryFormat[] {
  const formattedColumns: SchemaColumnQueryFormat[] = [];
  const columnMap: Record<number, SchemaColumnQueryFormat> = {};

  for (const row of schemaColumns) {
    const columnId = row.column_id;

    if (!columnMap[columnId]) {
      columnMap[columnId] = {
        column_id: row.column_id,
        column_technical_name: row.column_technical_name,
        column_alias: row.column_alias,
        column_description: row.column_description,
        column_data_type: row.column_data_type,
        is_primary_key: null,
        is_foreign_key: null,
        is_unique: null,
        relation_foreign_key_id: row.relation_foreign_key_id,
        relation_primary_key_id: row.relation_primary_key_id,
        relation_is_static: row.relation_is_static,
        column_key_is_static: [],
        column_key_type: [],
      };
    }

    const currentColumn = columnMap[columnId];

    // primary key
    if (row.column_key_type === entityKeyType.PRIMARY_KEY) {
      currentColumn.is_primary_key = row.column_key_is_static;
    } else if (row.column_key_type === entityKeyType.FOREIGN_KEY) {
      currentColumn.is_foreign_key = row.column_key_is_static;
    } else if (row.column_key_type === entityKeyType.UNIQUE_KEY) {
      currentColumn.is_unique = row.column_key_is_static;
    }

    if (row.column_key_is_static !== null) {
      if (currentColumn.column_key_is_static) {
        currentColumn.column_key_is_static.push(row.column_key_is_static);
      }
    }
    if (row.column_key_type !== null) {
      if (currentColumn.column_key_type) {
        currentColumn.column_key_type.push(row.column_key_type);
      }
    }
  }

  // Convert the map values back to an array
  formattedColumns.push(...Object.values(columnMap));
  return formattedColumns;
}
/** output
 * {
    "column_id": 551,
    "column_technical_name": "columnIdChild",
    "column_alias": null,
    "column_data_type": "integer",
    "is_primary_key": true,
    "is_foreign_key": true,
    "is_unique": null,
    "relation_foreign_key_id": 551,
    "relation_primary_key_id": 543,
    "relation_is_static": true,
    "column_key_is_static": [
      true,
      true
    ],
    "column_key_type": [
      "pk",
      "fk"
    ]
  },
 */
