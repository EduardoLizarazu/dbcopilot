/**
 * Transform:
 *  [
 *    { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE }, ...
 *  ]
 * into:
 *  [
 *    { schema, tables: [{ name, columns: [{ name, dataType }] }] }
 *  ]
 *
 * Notes:
 * - Exact match join (case-sensitive) for schema/table names.
 * - Dedup columns by exact COLUMN_NAME within each table.
 */

const { schemaV1 } = require("../const/schemav1");

function mapRawSchemaToOrganizationSchema(schemaV1) {
  const bySchema = new Map(); // schema -> { schema, tables: Map<tableName, { name, columns: Map<colName, { name, dataType }> }> }

  for (const row of schemaV1) {
    const { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE } = row;
    if (!TABLE_SCHEMA || !TABLE_NAME || !COLUMN_NAME) continue; // skip malformed rows

    // schema bucket
    let schemaEntry = bySchema.get(TABLE_SCHEMA);
    if (!schemaEntry) {
      schemaEntry = { schema: TABLE_SCHEMA, tables: new Map() };
      bySchema.set(TABLE_SCHEMA, schemaEntry);
    }

    // table bucket
    let tableEntry = schemaEntry.tables.get(TABLE_NAME);
    if (!tableEntry) {
      tableEntry = { name: TABLE_NAME, columns: new Map() };
      schemaEntry.tables.set(TABLE_NAME, tableEntry);
    }

    // column (dedupe by exact COLUMN_NAME)
    if (!tableEntry.columns.has(COLUMN_NAME)) {
      tableEntry.columns.set(COLUMN_NAME, {
        name: COLUMN_NAME,
        dataType: DATA_TYPE || null,
      });
    }
  }

  // materialize Maps into arrays in a stable insertion order
  const result = [];
  for (const [, schemaEntry] of bySchema) {
    const tablesArr = [];
    for (const [, tableEntry] of schemaEntry.tables) {
      const columnsArr = Array.from(tableEntry.columns.values());
      tablesArr.push({ name: tableEntry.name, columns: columnsArr });
    }
    result.push({ schema: schemaEntry.schema, tables: tablesArr });
  }
  return result;
}

function rowSchemaToOrganizationSchemaTest() {
  const organizationSchema = mapRawSchemaToOrganizationSchema(schemaV1);
  console.log(JSON.stringify(organizationSchema, null, 2));
}

module.exports = {
  mapRawSchemaToOrganizationSchema,
  rowSchemaToOrganizationSchemaTest,
};
