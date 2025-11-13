const { schemaV1 } = require("../const/schemav1");
const { schemaV2 } = require("../const/schemav2");
const {
  mapRawSchemaToOrganizationSchema,
} = require("../mapper/row-schema-to-orginize-schema");

// Compare two schema arrays and produce a structured diff.
// Output uses schemaStatus { UNCHANGED:0, NEW:1, NOT_FOUND:2 }
// Each schema: { schema: { name, status }, tables: [ { name, status, columns: [ { name, status, dataType: { name, status } } ] } ] }

const schemaStatus = {
  UNCHANGED: 0,
  NEW: 1,
  NOT_FOUND: 2,
};

function _getSchemaName(schema) {
  if (!schema) return null;
  if (typeof schema === "string") return schema;
  if (schema.name) return schema.name;
  if (schema.schema && typeof schema.schema === "string") return schema.schema;
  if (schema.schema && typeof schema.schema === "object" && schema.schema.name)
    return schema.schema.name;
  if (schema.schemaName) return schema.schemaName;
  return null;
}

function _getTableName(table) {
  if (!table) return null;
  if (table.name) return table.name;
  return null;
}

function _getColumnName(col) {
  if (!col) return null;
  if (col.name) return col.name;
  return null;
}

function _getDataTypeName(dt) {
  if (dt == null) return null;
  if (typeof dt === "string") return dt;
  if (typeof dt === "object" && dt.name) return dt.name;
  return null;
}

function compareSchemas(newSchemas = [], oldSchemas = []) {
  // Build maps by schema name
  const newMap = new Map();
  for (const s of newSchemas || []) {
    const name = _getSchemaName(s);
    if (!name) continue;
    newMap.set(name, s);
  }
  const oldMap = new Map();
  for (const s of oldSchemas || []) {
    const name = _getSchemaName(s);
    if (!name) continue;
    oldMap.set(name, s);
  }

  // Combined ordered schema names: new order first, then remaining old
  const orderedSchemaNames = [];
  for (const name of newMap.keys()) orderedSchemaNames.push(name);
  for (const name of oldMap.keys())
    if (!newMap.has(name)) orderedSchemaNames.push(name);

  const result = [];
  for (const schemaName of orderedSchemaNames) {
    const inNew = newMap.has(schemaName);
    const inOld = oldMap.has(schemaName);
    const schemaEntry = {
      schema: {
        name: schemaName,
        status:
          inNew && inOld
            ? schemaStatus.UNCHANGED
            : inNew
            ? schemaStatus.NEW
            : schemaStatus.NOT_FOUND,
      },
      tables: [],
    };

    const newSchema = newMap.get(schemaName);
    const oldSchema = oldMap.get(schemaName);

    const newTables = new Map();
    if (newSchema && Array.isArray(newSchema.tables)) {
      for (const t of newSchema.tables) {
        const tname = _getTableName(t);
        if (!tname) continue;
        newTables.set(tname, t);
      }
    }
    const oldTables = new Map();
    if (oldSchema && Array.isArray(oldSchema.tables)) {
      for (const t of oldSchema.tables) {
        const tname = _getTableName(t);
        if (!tname) continue;
        oldTables.set(tname, t);
      }
    }

    const orderedTableNames = [];
    for (const n of newTables.keys()) orderedTableNames.push(n);
    for (const n of oldTables.keys())
      if (!newTables.has(n)) orderedTableNames.push(n);

    for (const tableName of orderedTableNames) {
      const tInNew = newTables.has(tableName);
      const tInOld = oldTables.has(tableName);
      const tableEntry = {
        name: tableName,
        status:
          tInNew && tInOld
            ? schemaStatus.UNCHANGED
            : tInNew
            ? schemaStatus.NEW
            : schemaStatus.NOT_FOUND,
        columns: [],
      };

      const newTable = newTables.get(tableName);
      const oldTable = oldTables.get(tableName);

      const newCols = new Map();
      if (newTable && Array.isArray(newTable.columns)) {
        for (const c of newTable.columns) {
          const cname = _getColumnName(c);
          if (!cname) continue;
          newCols.set(cname, c);
        }
      }
      const oldCols = new Map();
      if (oldTable && Array.isArray(oldTable.columns)) {
        for (const c of oldTable.columns) {
          const cname = _getColumnName(c);
          if (!cname) continue;
          oldCols.set(cname, c);
        }
      }

      const orderedColNames = [];
      for (const n of newCols.keys()) orderedColNames.push(n);
      for (const n of oldCols.keys())
        if (!newCols.has(n)) orderedColNames.push(n);

      for (const colName of orderedColNames) {
        const cInNew = newCols.has(colName);
        const cInOld = oldCols.has(colName);
        const newCol = newCols.get(colName);
        const oldCol = oldCols.get(colName);

        const newType = newCol
          ? _getDataTypeName(
              newCol.dataType || newCol.dataTypeName || newCol.DATA_TYPE
            )
          : null;
        const oldType = oldCol
          ? _getDataTypeName(
              oldCol.dataType || oldCol.dataTypeName || oldCol.DATA_TYPE
            )
          : null;

        const colStatus =
          cInNew && cInOld
            ? schemaStatus.UNCHANGED
            : cInNew
            ? schemaStatus.NEW
            : schemaStatus.NOT_FOUND;

        let dataTypeStatus = schemaStatus.NOT_FOUND;
        if (newType != null && oldType != null) {
          dataTypeStatus =
            newType === oldType ? schemaStatus.UNCHANGED : schemaStatus.NEW;
        } else if (newType != null) {
          dataTypeStatus = schemaStatus.NEW;
        } else if (oldType != null) {
          dataTypeStatus = schemaStatus.NOT_FOUND;
        }

        tableEntry.columns.push({
          name: colName,
          status: colStatus,
          dataType: {
            name: newType != null ? newType : oldType,
            status: dataTypeStatus,
          },
        });
      }

      schemaEntry.tables.push(tableEntry);
    }

    result.push(schemaEntry);
  }

  return { schemaStatus, schemaDiff: result };
}

// test
function compareSchemasTest() {
  const result = compareSchemas(
    mapRawSchemaToOrganizationSchema(schemaV1),
    mapRawSchemaToOrganizationSchema(schemaV2)
  );
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { compareSchemas, schemaStatus, compareSchemasTest };
