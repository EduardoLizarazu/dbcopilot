"use server";

import {
  SchemaCtxDiffStatus,
  TSchemaCtxDiffSchemaDto,
  TSchemaCtxSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";

export async function FromSchemaDiffToSchemaCtxAction(data: {
  oldSchemaCtx: TSchemaCtxSchemaDto[];
  schemasCtxDiff: TSchemaCtxDiffSchemaDto[];
}): Promise<TSchemaCtxSchemaDto[]> {
  const { oldSchemaCtx, schemasCtxDiff } = data;

  // UN_CHANGED: means that the item is the same (schema/table/column)
  // NEW: means that add a new item (schema/table/column)
  // UPDATED: means that the item has been modified (schema/table/column)
  // DELETED: means that the item has been deleted (schema/table/column)
  // NON OF THEM A ARE HIERARCHICAL NEW/UPDATED/DELETED/UN_CHANGED RESPECT TO PARENT

  for (const schemaDiff of schemasCtxDiff) {
    if (schemaDiff.status === SchemaCtxDiffStatus.DELETE) {
      const schemaIndex = oldSchemaCtx.findIndex((s) => s.id === schemaDiff.id);
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

    for (const tableDiff of schemaDiff.tables) {
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
        console.log(
          "SCHEMA FOR TABLE UPDATE: ",
          JSON.stringify(schema, null, 2)
        );
        if (!schema) continue;
        const oldTable = (schema.tables || []).find(
          (t) => t.id === tableDiff.id
        );
        console.log("TABLE DIFF: ", JSON.stringify(tableDiff, null, 2));
        console.log(
          "OLD TABLE FOR UPDATE: ",
          JSON.stringify(oldTable, null, 2)
        );
        if (!oldTable) continue;
        oldTable.id = tableDiff.newId;
        oldTable.name = tableDiff.newName;
      }

      for (const colDiff of tableDiff.columns) {
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
            profile: {},
          });
        }
        if (colDiff.status === SchemaCtxDiffStatus.UPDATE) {
          const schema = oldSchemaCtx.find((s) => s.id === schemaDiff.id);
          if (!schema) continue;
          const table = (schema.tables || []).find(
            (t) => t.id === tableDiff.id
          );
          if (!table) continue;
          const oldCol = (table.columns || []).find((c) => c.id === colDiff.id);
          if (!oldCol) continue;
          oldCol.id = colDiff.newId;
          oldCol.name = colDiff.newName;
        }
      }
    }
  }

  return oldSchemaCtx;
}
