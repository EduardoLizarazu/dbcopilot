import {
  schemaCtxDiffSchema,
  SchemaCtxDiffStatus,
  schemaCtxSchema,
  TSchemaCtxDiffSchemaDto,
  TSchemaCtxSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface ICompareSchemaCtxStep {
  run(
    oldSchema: TSchemaCtxSchemaDto[],
    newSchema: TSchemaCtxSchemaDto[]
  ): Promise<TSchemaCtxDiffSchemaDto[]>;
}

export class CompareSchemaCtxStep implements ICompareSchemaCtxStep {
  constructor(private readonly logger: ILogger) {}

  async run(
    oldSchema: TSchemaCtxSchemaDto[],
    newSchema: TSchemaCtxSchemaDto[]
  ): Promise<TSchemaCtxDiffSchemaDto[]> {
    try {
      this.logger.info(
        `[CompareSchemaCtxStep] Comparing old and new schema contexts`
      );

      const vDataSchemaCtxOld = await schemaCtxSchema
        .array()
        .safeParseAsync(oldSchema);
      const vDataSchemaCtxNew = await schemaCtxSchema
        .array()
        .safeParseAsync(newSchema);
      if (!vDataSchemaCtxOld.success) {
        this.logger.error(
          `[CompareSchemaCtxStep] Validation errors in old schema context: ${JSON.stringify(vDataSchemaCtxOld.error.errors)}`
        );
        throw new Error(
          vDataSchemaCtxOld.error.errors.map((e) => e.message).join(", ") ||
            "Invalid old schema context data"
        );
      }

      if (!vDataSchemaCtxNew.success) {
        this.logger.error(
          `[CompareSchemaCtxStep] Validation errors in new schema context: ${JSON.stringify(vDataSchemaCtxNew.error.errors)}`
        );
        throw new Error(
          vDataSchemaCtxNew.error.errors.map((e) => e.message).join(", ") ||
            "Invalid old schema context data"
        );
      }

      if (!vDataSchemaCtxNew.success) {
        this.logger.error(
          `[CompareSchemaCtxStep] Validation errors in new schema context: ${JSON.stringify(vDataSchemaCtxNew.error)}`
        );
        throw new Error(
          vDataSchemaCtxNew.error || "Invalid new schema context data"
        );
      }

      const newData = vDataSchemaCtxNew.data;
      const oldData = vDataSchemaCtxOld.data;

      const schemaDiff = _compareSchemas(newData, oldData);
      this.logger.info(`[CompareSchemaCtxStep] Schema diff:`, schemaDiff);
      // Validation and return
      const vDiffSchema = await schemaCtxDiffSchema
        .array()
        .safeParseAsync(schemaDiff);
      if (!vDiffSchema.success) {
        this.logger.error(
          `[CompareSchemaCtxStep] Validation errors in diff schema context: `,
          vDiffSchema.error.errors
        );
        throw new Error("Invalid diff schema context data");
      }

      return vDiffSchema.data;
    } catch (error) {
      this.logger.error(
        `[CompareSchemaCtxStep] Error comparing schema contexts: `,
        error.message
      );
      throw new Error(error.message || "Error comparing schema contexts");
    }
  }
}

// Compare two schema arrays and produce a structured diff.
// Output uses schemaStatus { UN_CHANGE:0, NEW:1, DELETE:2 }
// Each schema: { id, name, status, tables: [ { id, name, status, columns: [ { id, name, status, dataType: { name, status } } ] } ] }

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

function _getSchemaId(schema) {
  if (!schema) return null;
  if (schema.id) return schema.id;
  if (schema.schema && typeof schema.schema === "object" && schema.schema.id)
    return schema.schema.id;
  if (schema.schemaId) return schema.schemaId;
  return null;
}

function _getTableId(table) {
  if (!table) return null;
  if (table.id) return table.id;
  if (table.tableId) return table.tableId;
  return null;
}

function _getColumnId(col) {
  if (!col) return null;
  if (col.id) return col.id;
  if (col.columnId) return col.columnId;
  return null;
}

function _compareSchemas(
  newSchemas: TSchemaCtxSchemaDto[],
  oldSchemas: TSchemaCtxSchemaDto[]
): TSchemaCtxDiffSchemaDto[] {
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
    const newSchema = newMap.get(schemaName);
    const oldSchema = oldMap.get(schemaName);
    const schemaEntry = {
      id: _getSchemaId(newSchema) ?? _getSchemaId(oldSchema),
      name: schemaName,
      status:
        inNew && inOld
          ? SchemaCtxDiffStatus.UN_CHANGE
          : inNew
            ? SchemaCtxDiffStatus.NEW
            : SchemaCtxDiffStatus.DELETE,
      tables: [],
    };

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
      const newTable = newTables.get(tableName);
      const oldTable = oldTables.get(tableName);
      const tableEntry = {
        id: _getTableId(newTable) ?? _getTableId(oldTable),
        name: tableName,
        status:
          tInNew && tInOld
            ? SchemaCtxDiffStatus.UN_CHANGE
            : tInNew
              ? SchemaCtxDiffStatus.NEW
              : SchemaCtxDiffStatus.DELETE,
        columns: [],
      };

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
            ? SchemaCtxDiffStatus.UN_CHANGE
            : cInNew
              ? SchemaCtxDiffStatus.NEW
              : SchemaCtxDiffStatus.DELETE;

        let dataTypeStatus = SchemaCtxDiffStatus.DELETE;
        if (newType != null && oldType != null) {
          dataTypeStatus =
            newType === oldType
              ? SchemaCtxDiffStatus.UN_CHANGE
              : SchemaCtxDiffStatus.NEW;
        } else if (newType != null) {
          dataTypeStatus = SchemaCtxDiffStatus.NEW;
        } else if (oldType != null) {
          dataTypeStatus = SchemaCtxDiffStatus.DELETE;
        }

        tableEntry.columns.push({
          id: _getColumnId(newCol) ?? _getColumnId(oldCol),
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

  return result;
}
