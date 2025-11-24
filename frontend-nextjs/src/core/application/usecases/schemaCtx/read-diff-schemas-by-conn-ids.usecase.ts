import {
  schemaCtxSchema,
  TSchemaCtxCounterDto,
  TSchemaCtxDiffBaseDto,
  TSchemaCtxSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IExtractSchemaBasedStep } from "../../steps/infoBased/extract-schemabased.step";
import { ICompareSchemaCtxStep } from "../../steps/schemaCtx/compare-schema-ctx.step";
import { ICountDiffSchemaCtxStep } from "../../steps/schemaCtx/count-diff-schema-ctx.step";
import { IFormatSchemaCtxStep } from "../../steps/schemaCtx/format-schema-ctx.step";
import { IMergeSchemaCtxRawStep } from "../../steps/schemaCtx/merge-schema-ctx-raw.step";
import { IReadByIdSchemaCtxStep } from "../../steps/schemaCtx/read-by-id-schema-ctx.step";

export interface IReadDiffSchemasByConnIdsUseCase {
  execute(data: {
    oldSchema: TSchemaCtxSchemaDto[];
    connIds: string[];
  }): Promise<
    TResponseDto<{
      diffSchemas: TSchemaCtxDiffBaseDto[];
      diffCount: TSchemaCtxCounterDto;
    }>
  >;
}

export class ReadDiffSchemasByConnIdsUseCase
  implements IReadDiffSchemasByConnIdsUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readByIdDbConnStep: IReadDbConnByIdStep,
    private readonly extractSchemaBasedStep: IExtractSchemaBasedStep,
    private readonly mergeSchemaCtxRawStep: IMergeSchemaCtxRawStep,
    private readonly formatSchemaCtxStep: IFormatSchemaCtxStep,
    private readonly compareSchemaCtxStep: ICompareSchemaCtxStep,
    private readonly countDiffSchemaCtxStep: ICountDiffSchemaCtxStep
  ) {}

  async execute(data: {
    oldSchema: TSchemaCtxSchemaDto[];
    connIds: string[];
  }): Promise<
    TResponseDto<{
      diffSchemas: TSchemaCtxDiffBaseDto[];
      diffCount: TSchemaCtxCounterDto;
    }>
  > {
    // Implementation here
    try {
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Executing use case with data:`,
        data
      );

      const vOldSchemaCtx = await schemaCtxSchema
        .array()
        .safeParseAsync(data.oldSchema);
      if (!vOldSchemaCtx.success) {
        this.logger.error(
          `[ReadDiffSchemasByConnIdsUseCase] Old Schema Context validation failed: `,
          vOldSchemaCtx.error
        );
        throw new Error("Old Schema Context validation failed");
      }

      // NEW PART
      // Retrieve connections by id
      const newConnections = data.connIds.map(async (connId) => {
        const conn = await this.readByIdDbConnStep.run({ dbConnId: connId });
        if (!conn) {
          this.logger.warn(
            `[ReadDiffSchemasByConnIdsUseCase] DB Connection not found for ID: ${connId}`
          );
        }
        return conn;
      });
      const resolvedNewConnections = await Promise.all(newConnections);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Resolved new connections: `,
        resolvedNewConnections
      );

      // Retrieve schemas from connections
      const newRawSchemas = resolvedNewConnections.map(async (conn) => {
        if (!conn) return null;
        const schemaInfo = await this.extractSchemaBasedStep.run({
          ...conn,
        });
        return schemaInfo;
      });
      const resolvedNewRawSchemas = await Promise.all(newRawSchemas);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Resolved new raw schemas: `,
        resolvedNewRawSchemas
      );
      // OLD PART /// PARA QUE SACAR LAS VIEJAS CONEXIONES SI NO SE USAN??? DIRECTAMENTE SACAR EL ESQUEMA GUARDADO

      // WHAT CHANGES BETWEEN OLD AND NEW SCHEMAS
      // Merge raw schemas
      const mergeNewRawSchema = await this.mergeSchemaCtxRawStep.run(
        resolvedNewRawSchemas.filter((s) => s !== null)
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Merged new raw schema: `,
        mergeNewRawSchema
      );

      // Format Schemas
      const formatNewSchema =
        await this.formatSchemaCtxStep.run(mergeNewRawSchema);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Formatted new schema: `,
        formatNewSchema
      );

      // Compare Schemas
      const diffSchema = await this.compareSchemaCtxStep.run(
        vOldSchemaCtx.data,
        formatNewSchema
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Diff schema context: `,
        diffSchema
      );

      const diffSchemaCount = await this.countDiffSchemaCtxStep.run(diffSchema);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Diff schema count: `,
        diffSchemaCount
      );

      return {
        success: true,
        message: "Successfully read diff schemas by connection IDs",
        data: {
          diffSchemas: diffSchema,
          diffCount: diffSchemaCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `[ReadDiffSchemasByConnIdsUseCase] Error executing use case: ${error}`
      );
      return {
        success: false,
        message:
          error.message || "Error reading diff schemas by connection IDs",
        data: null,
      };
    }
  }
}
