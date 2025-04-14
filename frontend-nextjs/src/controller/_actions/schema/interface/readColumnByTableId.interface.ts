/** input
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

export interface SchemaColumnQueryFormat {
  column_id: number;
  column_technical_name: string;
  column_alias: string | null;
  column_description: string;
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
