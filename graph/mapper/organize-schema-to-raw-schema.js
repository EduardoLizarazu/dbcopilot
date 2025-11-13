/**
 * Inverse of `row-schema-to-orginize-schema.js`:
 * Given an organization schema array of the form:
 * [ { schema: { name }, tables: [ { name, columns: [ { name, dataType: { name } } ] } ] } ]
 * produce an array of raw rows:
 * [ { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE }, ... ]
 */

function mapOrganizationSchemaToRawRows(orgSchemas) {
  if (!Array.isArray(orgSchemas)) return [];
  const out = [];
  for (const s of orgSchemas) {
    const schemaName =
      s && s.schema && (s.schema.name || s.schemaName)
        ? s.schema.name || s.schemaName
        : null;
    if (!schemaName) continue;
    const tables = Array.isArray(s.tables) ? s.tables : [];
    for (const t of tables) {
      const tableName = t && t.name ? t.name : null;
      if (!tableName) continue;
      const columns = Array.isArray(t.columns) ? t.columns : [];
      for (const c of columns) {
        const columnName = c && c.name ? c.name : null;
        if (!columnName) continue;
        // dataType may be { name } or a string
        let dataType = null;
        if (c.dataType && typeof c.dataType === "object" && c.dataType.name)
          dataType = c.dataType.name;
        else if (typeof c.dataType === "string") dataType = c.dataType;
        // push raw row
        out.push({
          TABLE_SCHEMA: schemaName,
          TABLE_NAME: tableName,
          COLUMN_NAME: columnName,
          DATA_TYPE: dataType,
        });
      }
    }
  }
  return out;
}
const { schemaV1 } = require("../const/schemav1");
const {
  mapRawSchemaToOrganizationSchema,
} = require("./row-schema-to-orginize-schema");

// small test helper: roundtrip the provided schemaV1
function organizeSchemaToRawSchemaTest() {
  try {
    const org = mapRawSchemaToOrganizationSchema(schemaV1);
    const back = mapOrganizationSchemaToRawRows(org);
    console.log(
      "original rows:",
      schemaV1.length,
      "org schemas:",
      org.length,
      "roundtrip rows:",
      back.length
    );
    // print first few rows for manual inspection
    console.log(JSON.stringify(back.slice(0, 10), null, 2));
  } catch (err) {
    console.log(
      "organizeSchemaToRawSchemaTest: cannot run test -",
      err && err.message
    );
  }
}

module.exports = {
  mapOrganizationSchemaToRawRows,
  organizeSchemaToRawSchemaTest,
};
