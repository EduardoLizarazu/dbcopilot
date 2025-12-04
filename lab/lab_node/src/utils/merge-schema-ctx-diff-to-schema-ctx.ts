import { schemaCtx } from "../const/schemaCtx";
import { schemaCtxDiff } from "../const/schemaCtxDiff";

enum SchemaCtxDiffStatus {
  DELETE = 2,
  NEW = 1,
  UPDATE = 3,
}

type SchemaCtx = typeof schemaCtx;
type SchemaCtxDiff = typeof schemaCtxDiff;

export function FromSchemaDiffToSchemaCtxAction(data: {
  oldSchemaCtx: SchemaCtx;
  schemasCtxDiff: SchemaCtxDiff;
}): SchemaCtx {
  const { oldSchemaCtx, schemasCtxDiff } = data;

  // UN_CHANGED: means that the item is the same (schema/table/column)
  // NEW: means that add a new item (schema/table/column)
  // UPDATED: means that the item has been modified (schema/table/column)
  // DELETED: means that the item has been deleted (schema/table/column)
  // NON OF THEM A ARE HIERARCHICAL NEW/UPDATED/DELETED/UN_CHANGED RESPECT TO PARENT

  for (const schemaDiff of schemasCtxDiff) {
    for (const tableDiff of schemaDiff.tables) {
      for (const colDiff of tableDiff.columns) {
        // SCHEMA LEVEL CHANGES
        if (schemaDiff.status === SchemaCtxDiffStatus.DELETE) {
          const schemaIndex = oldSchemaCtx.findIndex(
            (s) => s.id === schemaDiff.id
          );
          if (schemaIndex >= 0) oldSchemaCtx.splice(schemaIndex, 1);
        }
        if (schemaDiff.status === SchemaCtxDiffStatus.NEW) {
          oldSchemaCtx.push({
            id: schemaDiff.id,
            name: schemaDiff.name,
            description: "",
            aliases: [],
            tables: [],
          });
        }
        if (schemaDiff.status === SchemaCtxDiffStatus.UPDATE) {
          const oldSchema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!oldSchema) continue;
          oldSchema.id = schemaDiff.newId;
          oldSchema.name = schemaDiff.newName;
        }

        // TABLE LEVEL CHANGES
        if (tableDiff.status === SchemaCtxDiffStatus.DELETE) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          const tableIndex = (schema.tables || []).findIndex(
            (t) => t.id === tableDiff.id
          );
          if (tableIndex >= 0) (schema.tables || []).splice(tableIndex, 1);
        }
        if (tableDiff.status === SchemaCtxDiffStatus.NEW) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          (schema.tables = schema.tables || []).push({
            id: tableDiff.id,
            name: tableDiff.name,
            description: "",
            aliases: [],
            columns: [],
          });
        }

        if (tableDiff.status === SchemaCtxDiffStatus.UPDATE) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          const oldTable = (schema?.tables || []).find(
            (t) => t.id === tableDiff.oldId || t.id === tableDiff.id
          );
          if (!oldTable) continue;
          oldTable.id = tableDiff.id;
          oldTable.name = tableDiff.name;
        }

        // COLUMN LEVEL CHANGES
        if (colDiff.status === SchemaCtxDiffStatus.DELETE) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          const table = (schema.tables || []).find(
            (t) => t.id === tableDiff.id
          );
          if (!table) continue;
          const colIndex = (table.columns || []).findIndex(
            (c) => c.id === colDiff.id
          );
          if (colIndex >= 0) (table.columns || []).splice(colIndex, 1);
        }
        if (colDiff.status === SchemaCtxDiffStatus.NEW) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          const table = (schema.tables || []).find(
            (t) => t.id === tableDiff.id
          );
          if (!table) continue;
          (table.columns = table.columns || []).push({
            id: colDiff.id,
            name: colDiff.name,
            description: "",
            aliases: [],
            dataType: colDiff.dataType?.name || "unknown",
            profile: {
              minValue: "",
              countNulls: 0,
              countUnique: 0,
              maxValue: "",
              sampleUnique: [],
            },
          });
        }
        if (colDiff.status === SchemaCtxDiffStatus.UPDATE) {
          // if (colDiff.id === "tmprd.sc6301.c6_id_change") {
          //   console.log("Found column to update:", colDiff);
          // }
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;

          const table = (schema.tables || []).find(
            (t) => t.id === tableDiff.id
          );
          if (!table) continue;

          const oldCol = (table.columns || []).find(
            (c) => c.id === colDiff.id || c.id === colDiff.oldId
          );
          if (!oldCol) continue;

          oldCol.id = colDiff.id;
          oldCol.name = colDiff.name;
        }
        // COLUMN DATA TYPE UPDATE
        if (colDiff?.dataType?.status === SchemaCtxDiffStatus.NEW) {
          // console.log("ENTERING DATA TYPE UPDATE FOR COLUMN:");

          // Goal: update also the data type with the new column data type always
          // Split new id to get the data type
          // schema.table.column -> schema -> schema.table. -> schema.table.column
          const newIdParts = colDiff.id.split(".");
          const [schemaId, tableId, columnId] = newIdParts;
          const newSchemaId = `${schemaId}`;
          const newTableId = `${schemaId}.${tableId}`;
          const newColumnId = `${schemaId}.${tableId}.${columnId}`;
          // console.log("Updating data type for column:", newColumnId);

          const oldSchema = oldSchemaCtx.find((s) => s.id === newSchemaId);
          if (!oldSchema) continue;

          const oldTable = (oldSchema.tables || []).find(
            (t) => t.id === newTableId
          );
          if (!oldTable) continue;

          const oldCol = (oldTable.columns || []).find(
            (c) => c.id === newColumnId
          );
          if (!oldCol) continue;
          // console.log("Old Column before data type update:", oldCol.dataType);
          oldCol.dataType = colDiff.dataType.name;
          // console.log("Old Column after data type update:", oldCol.dataType);
        }
      }
    }
  }
  // console.log("Resulting SchemaCtx:", JSON.stringify(oldSchemaCtx, null, 2));

  const res = JSON.parse(JSON.stringify(oldSchemaCtx));

  return res;
}
