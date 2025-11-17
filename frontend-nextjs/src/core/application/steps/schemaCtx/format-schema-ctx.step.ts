/**
 * Inverse of `row-schema-to-orginize-schema.js`:
 * Given an organization schema array of the form:
 * [ { schema: { name }, tables: [ { name, columns: [ { name, dataType: { name } } ] } ] } ]
 * produce an array of raw rows:
 * [ { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE }, ... ]
 */

import { TNlqQaInformationSchemaExtractionDto } from "../../dtos/nlq/nlq-qa-information.app.dto";
import {
  createSchemaCtxBase,
  createSchemaCtxBaseInReq,
  TCreateSchemaCtxBaseDto,
  TCreateSchemaCtxBaseInReqDto,
  TSchemaCtxColumnDto,
  TSchemaCtxSchemaDto,
  TSchemaCtxTableDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IFormatSchemaCtxStep {
  run(data: TCreateSchemaCtxBaseInReqDto): Promise<TCreateSchemaCtxBaseDto>;
}

export class FormatSchemaCtxStep implements IFormatSchemaCtxStep {
  constructor(private readonly logger: ILogger) {}

  async run(
    data: TCreateSchemaCtxBaseInReqDto
  ): Promise<TCreateSchemaCtxBaseDto> {
    try {
      this.logger.info(
        `[FormatSchemaCtxStep] Formatting schema context data: ${JSON.stringify(data)}`
      );

      const vData = await createSchemaCtxBaseInReq.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[FormatSchemaCtxStep] Validation errors: ${JSON.stringify(vData.error.issues)}`
        );
        throw new Error(
          vData.error.errors.map((e) => e.message).join(", ") ||
            "Invalid schema context data"
        );
      }
      const rawData = vData.data;
      const formatSchemaCtx = _mapRawSchemaToOrganizationSchema(
        rawData.schemaCtx
      );

      // Build a transformed object matching the `createSchemaCtxBase` shape
      const transformed: TCreateSchemaCtxBaseDto = {
        ...rawData,
        schemaCtx: formatSchemaCtx,
      };

      // Validate transformed data against the createSchemaCtxBase schema
      const finalData = await createSchemaCtxBase.safeParseAsync(transformed);
      if (!finalData.success) {
        this.logger.error(
          `[FormatSchemaCtxStep] Final validation errors: ${JSON.stringify(
            finalData.error.issues
          )}`
        );
        throw new Error(
          finalData.error.errors.map((e) => e.message).join(", ") ||
            "Invalid final schema context data"
        );
      }

      return finalData.data;
    } catch (error) {
      this.logger.error(
        `[FormatSchemaCtxStep] Error formatting schema context data: `,
        error.message
      );
      throw new Error(error.message || "Error formatting schema context data");
    }
  }
}

function _mapRawSchemaToOrganizationSchema(
  rawSchema: TNlqQaInformationSchemaExtractionDto
): TSchemaCtxSchemaDto[] {
  type ColumnEntry = { name: string; dataTypeName: string | null };
  type TableEntry = { name: string; columns: Map<string, ColumnEntry> };
  type SchemaEntry = { schemaName: string; tables: Map<string, TableEntry> };

  const bySchema = new Map<string, SchemaEntry>(); // schemaName -> SchemaEntry

  for (const row of rawSchema) {
    const { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE } = row;
    if (!TABLE_SCHEMA || !TABLE_NAME || !COLUMN_NAME) continue; // skip malformed rows

    // schema bucket
    let schemaEntry = bySchema.get(TABLE_SCHEMA);
    if (!schemaEntry) {
      schemaEntry = { schemaName: TABLE_SCHEMA, tables: new Map() };
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
        dataTypeName: DATA_TYPE || null,
      });
    }
  }

  // materialize Maps into arrays in a stable insertion order
  const result: TSchemaCtxSchemaDto[] = [];
  for (const [, schemaEntry] of bySchema) {
    const tablesArr: TSchemaCtxTableDto[] = [];
    for (const [, tableEntry] of schemaEntry.tables) {
      const columnsArr: TSchemaCtxColumnDto[] = Array.from(
        tableEntry.columns.values()
      ).map((c) => ({
        id: `${schemaEntry.schemaName}.${tableEntry.name}.${c.name}`,
        name: c.name,
        dataType: c.dataTypeName,
      }));
      tablesArr.push({
        id: `${schemaEntry.schemaName}.${tableEntry.name}`,
        name: tableEntry.name,
        columns: columnsArr,
      });
    }
    result.push({
      id: `${schemaEntry.schemaName}`,
      name: schemaEntry.schemaName,
      tables: tablesArr,
    });
  }
  return result;
}
