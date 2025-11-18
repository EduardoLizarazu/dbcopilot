import {
  TSchemaCtxDiffBaseDto,
  TSchemaCtxSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IExtractSchemaBasedStep } from "../../steps/infoBased/extract-schemabased.step";
import { IFormatSchemaCtxStep } from "../../steps/schemaCtx/format-schema-ctx.step";
import { IMergeSchemaCtxRawStep } from "../../steps/schemaCtx/merge-schema-ctx-raw.step";

export interface IReadNewSchemasByConnIdsUseCase {
  execute(data: {
    connIds: string[];
  }): Promise<TResponseDto<TSchemaCtxSchemaDto[]>>;
}

export class ReadNewSchemasByConnIdsUseCase
  implements IReadNewSchemasByConnIdsUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readByIdDbConnStep: IReadDbConnByIdStep,
    private readonly extractSchemaBasedStep: IExtractSchemaBasedStep,
    private readonly mergeSchemaCtxRawStep: IMergeSchemaCtxRawStep,
    private readonly formatSchemaCtxStep: IFormatSchemaCtxStep
  ) {}

  async execute(data: {
    connIds: string[];
  }): Promise<TResponseDto<TSchemaCtxSchemaDto[]>> {
    // Implementation here
    try {
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Executing use case with data:`,
        data
      );

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
        `[ReadDiffSchemasByConnIdsUseCase] Retrieved new connections:`,
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
        `[ReadDiffSchemasByConnIdsUseCase] Retrieved new raw schemas:`,
        resolvedNewRawSchemas
      );

      // WHAT CHANGES BETWEEN OLD AND NEW SCHEMAS
      // Merge raw schemas
      const mergeNewRawSchema = await this.mergeSchemaCtxRawStep.run(
        resolvedNewRawSchemas.filter((s) => s !== null)
      );
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Merged new raw schemas:`,
        mergeNewRawSchema
      );

      // Format Schema

      const formatNewSchema =
        await this.formatSchemaCtxStep.run(mergeNewRawSchema);
      this.logger.info(
        `[ReadDiffSchemasByConnIdsUseCase] Retrieved formatted new schemas:`,
        formatNewSchema
      );

      return {
        success: true,
        message: "Successfully read diff schemas by connection IDs",
        data: formatNewSchema,
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
