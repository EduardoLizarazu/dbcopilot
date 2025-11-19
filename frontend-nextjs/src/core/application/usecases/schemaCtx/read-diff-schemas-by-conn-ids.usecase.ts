import {
  schemaCtxDiffSchema,
  TSchemaCtxDiffBaseDto,
} from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IExtractSchemaBasedStep } from "../../steps/infoBased/extract-schemabased.step";
import { ICompareSchemaCtxStep } from "../../steps/schemaCtx/compare-schema-ctx.step";
import { IFormatSchemaCtxStep } from "../../steps/schemaCtx/format-schema-ctx.step";
import { IMergeSchemaCtxRawStep } from "../../steps/schemaCtx/merge-schema-ctx-raw.step";
import { IReadByIdSchemaCtxStep } from "../../steps/schemaCtx/read-by-id-schema-ctx.step";

export interface IReadDiffSchemasByConnIdsUseCase {
  execute(data: {
    schemaCtxId: string;
    connIds: string[];
  }): Promise<TResponseDto<TSchemaCtxDiffBaseDto[]>>;
}

export class ReadDiffSchemasByConnIdsUseCase
  implements IReadDiffSchemasByConnIdsUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readByIdSchemaCtxStep: IReadByIdSchemaCtxStep,
    private readonly readByIdDbConnStep: IReadDbConnByIdStep,
    private readonly extractSchemaBasedStep: IExtractSchemaBasedStep,
    private readonly mergeSchemaCtxRawStep: IMergeSchemaCtxRawStep,
    private readonly formatSchemaCtxStep: IFormatSchemaCtxStep,
    private readonly compareSchemaCtxStep: ICompareSchemaCtxStep
  ) {}

  async execute(data: {
    schemaCtxId: string;
    connIds: string[];
  }): Promise<TResponseDto<TSchemaCtxDiffBaseDto[]>> {
    // Implementation here
    try {
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Executing use case with data:`,
        data
      );

      const schemaCtx = await this.readByIdSchemaCtxStep.run(data.schemaCtxId);
      if (!schemaCtx) {
        this.logger.warn(
          `[ReadDiffSchemasByConnIdsUseCase] Schema context not found for ID: ${data.schemaCtxId}`
        );
        return {
          success: false,
          message: "Schema context not found",
          data: null,
        };
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
      // OLD PART
      // Retrieve connections by id
      const oldConnections = schemaCtx.dbConnectionIds.map(async (connId) => {
        const conn = await this.readByIdDbConnStep.run({ dbConnId: connId });
        if (!conn) {
          this.logger.warn(
            `[ReadDiffSchemasByConnIdsUseCase] DB Connection not found for ID: ${connId}`
          );
        }
        return conn;
      });
      const resolvedOldConnections = await Promise.all(oldConnections);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Resolved old connections: `,
        resolvedOldConnections
      );

      // Retrieve schemas from connections
      const oldRawSchemas = resolvedOldConnections.map(async (conn) => {
        if (!conn) return null;
        const schemaInfo = await this.extractSchemaBasedStep.run({
          ...conn,
        });
        return schemaInfo;
      });
      const resolvedOldRawSchemas = await Promise.all(oldRawSchemas);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Resolved old raw schemas: `,
        resolvedOldRawSchemas
      );

      // WHAT CHANGES BETWEEN OLD AND NEW SCHEMAS
      // Merge raw schemas
      const mergeNewRawSchema = await this.mergeSchemaCtxRawStep.run(
        resolvedNewRawSchemas.filter((s) => s !== null)
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Merged new raw schema: `,
        mergeNewRawSchema
      );
      const mergeOldRawSchema = await this.mergeSchemaCtxRawStep.run(
        resolvedOldRawSchemas.filter((s) => s !== null)
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Merged old raw schema: `,
        mergeOldRawSchema
      );

      // Format Schema
      const formatOldSchema =
        await this.formatSchemaCtxStep.run(mergeOldRawSchema);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Formatted old schema: `,
        formatOldSchema
      );
      const formatNewSchema =
        await this.formatSchemaCtxStep.run(mergeNewRawSchema);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Formatted new schema: `,
        formatNewSchema
      );

      // Compare Schemas
      const diffSchema = await this.compareSchemaCtxStep.run(
        formatOldSchema,
        formatNewSchema
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Diff schema context: `,
        diffSchema
      );

      // Validation and return
      const vDiffSchema = await schemaCtxDiffSchema
        .array()
        .safeParseAsync(diffSchema);
      if (!vDiffSchema.success) {
        this.logger.error(
          `[ReadDiffSchemasByConnIdsUseCase] Validation errors in diff schema context: `,
          vDiffSchema.error.errors
        );
        throw new Error("Invalid diff schema context data");
      }

      return {
        success: true,
        message: "Successfully read diff schemas by connection IDs",
        data: vDiffSchema.data,
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
