import { TNlqQaInformationSchemaExtractionDto } from "../../dtos/nlq/nlq-qa-information.app.dto";
import {
  createSchemaCtxBase,
  createSchemaCtxBaseInReq,
  TCreateSchemaCtxBaseDto,
  TCreateSchemaCtxBaseInReqDto,
  TSchemaCtxSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

/**
 * Inverse of `row-schema-to-orginize-schema.js`:
 * Given an organization schema array of the form:
 * [ { schema: { name }, tables: [ { name, columns: [ { name, dataType: { name } } ] } ] } ]
 * produce an array of raw rows:
 * [ { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE }, ... ]
 */

export interface IUnFormatSchemaCtxStep {
  run(data: TCreateSchemaCtxBaseDto): Promise<TCreateSchemaCtxBaseInReqDto>;
}

export class UnFormatSchemaCtxStep implements IUnFormatSchemaCtxStep {
  constructor(private readonly logger: ILogger) {}

  async run(
    data: TCreateSchemaCtxBaseDto
  ): Promise<TCreateSchemaCtxBaseInReqDto> {
    try {
      this.logger.info(
        `[FormatSchemaCtxStep] Formatting schema context data: ${JSON.stringify(data)}`
      );

      const vData = await createSchemaCtxBase.safeParseAsync(data);
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
      const unFormatSchemaCtx = _mapOrganizationSchemaToRawRows(
        rawData.schemaCtx
      );
      // Build a transformed object matching the `createSchemaCtxBaseInReq` shape
      const transformed: TCreateSchemaCtxBaseInReqDto = {
        ...rawData,
        schemaCtx: unFormatSchemaCtx,
      };

      return transformed;
    } catch (error) {
      this.logger.error(
        `[FormatSchemaCtxStep] Error formatting schema context data: `,
        error.message
      );
      throw new Error(error.message || "Error formatting schema context data");
    }
  }
}

/**
 * Inverse of `row-schema-to-orginize-schema.js`:
 * Given an organization schema array of the form:
 * [ { schema: { name }, tables: [ { name, columns: [ { name, dataType: { name } } ] } ] } ]
 * produce an array of raw rows:
 * [ { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE }, ... ]
 */

function _mapOrganizationSchemaToRawRows(
  orgSchemas: TSchemaCtxSchemaDto[]
): TNlqQaInformationSchemaExtractionDto {
  if (!Array.isArray(orgSchemas)) return [];
  const out = [];
  for (const s of orgSchemas) {
    const schemaName = s && s.name ? s.name : null;
    if (!schemaName) continue;
    const tables = Array.isArray(s.tables) ? s.tables : [];
    for (const t of tables) {
      const tableName = t && t.name ? t.name : null;
      if (!tableName) continue;
      const columns = Array.isArray(t.columns) ? t.columns : [];
      for (const c of columns) {
        const columnName = c && c.name ? c.name : null;
        if (!columnName) continue;
        let dataType = null;
        if (c.dataType && typeof c.dataType === "object" && c.dataType)
          dataType = c.dataType;
        else if (typeof c.dataType === "string") dataType = c.dataType;
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
