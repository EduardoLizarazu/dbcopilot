import { nlqQaInformationSchemaExtraction } from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TSchemaCtxRaw } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IMergeSchemaCtxRawStep {
  run(data: TSchemaCtxRaw[]): Promise<TSchemaCtxRaw>;
}

export class MergeSchemaCtxRawStep implements IMergeSchemaCtxRawStep {
  constructor(private readonly logger: ILogger) {}

  async run(data: TSchemaCtxRaw[]): Promise<TSchemaCtxRaw> {
    try {
      this.logger.info(
        `[MergeSchemaCtxRawStep] Merging schema context raw data: ${JSON.stringify(
          data
        )}`
      );

      let vData = null;
      for (const schema of data) {
        const vSchema =
          await nlqQaInformationSchemaExtraction.safeParseAsync(schema);
        if (!vSchema.success) {
          this.logger.error(
            `[MergeSchemaCtxRawStep] Validation errors in one of the schemas: ${JSON.stringify(vSchema.error.issues)}`
          );
          throw new Error(
            vSchema.error.errors.map((e) => e.message).join(", ") ||
              "Invalid schema context raw data"
          );
        }
        vData = vSchema.data;
      }

      const mergedData: TSchemaCtxRaw = _joinSchemas(data);

      const finalData =
        await nlqQaInformationSchemaExtraction.parseAsync(mergedData);
      return finalData;
    } catch (error) {
      this.logger.error(
        `[MergeSchemaCtxRawStep] Error merging schema context raw data: `,
        error.message
      );
      throw new Error(error.message || "Error merging schema context raw data");
    }
  }
}

/**
 * Join multiple raw information-schema row arrays into one deduplicated array.
 *
 * Input rows must have fields: TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE
 * The result will contain one row per unique tuple (TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE)
 *
 * Usage:
 *   const { joinSchemas } = require('./schema/join-schema');
 *   const merged = joinSchemas(array1, array2, ...);
 */

function _keyForRow(row) {
  if (!row || typeof row !== "object") return null;
  const s = row.TABLE_SCHEMA || "";
  const t = row.TABLE_NAME || "";
  const c = row.COLUMN_NAME || "";
  const d = row.DATA_TYPE || "";
  // Use a delimiter unlikely to appear in names
  return `${s}||${t}||${c}||${d}`;
}

function _joinSchemas(schemaArrays: TSchemaCtxRaw[]): TSchemaCtxRaw {
  // Accept ONLY a single argument: an array of arrays ([a, b, n]).
  // Example: joinSchemas([array1, array2, array3])
  if (!Array.isArray(schemaArrays)) {
    throw new TypeError(
      "joinSchemas expects a single argument: an array of arrays"
    );
  }

  const seen = new Set();
  const out = [];

  for (const arr of schemaArrays) {
    if (!Array.isArray(arr)) continue; // skip non-arrays inside the top-level array
    for (const row of arr) {
      const key = _keyForRow(row);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      // push a shallow copy to avoid accidental mutations
      out.push(Object.assign({}, row));
    }
  }

  return out;
}
