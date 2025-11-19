import {
  schemaCtxDiffSchema,
  SchemaCtxDiffStatus,
  TSchemaCtxCounterDto,
  TSchemaCtxDiffSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface ICountDiffSchemaCtxStep {
  run(data: TSchemaCtxDiffSchemaDto[]): Promise<TSchemaCtxCounterDto>;
}

export class CountDiffSchemaCtxStep implements ICountDiffSchemaCtxStep {
  constructor(private readonly logger: ILogger) {}

  async run(data: TSchemaCtxDiffSchemaDto[]): Promise<TSchemaCtxCounterDto> {
    try {
      this.logger.info("Counting diff schema context...");

      const vData = await schemaCtxDiffSchema.array().safeParseAsync(data);

      if (!vData.success) {
        this.logger.error(
          `[CountDiffSchemaCtxStep] Validation failed: `,
          vData.error
        );
        throw new Error("Invalid diff schema context data");
      }

      let totalUnChanged = 0;
      let totalNews = 0;
      let totalDeleted = 0;
      for (const schema of vData.data) {
        for (const table of schema.tables) {
          for (const column of table.columns) {
            switch (column.status) {
              case SchemaCtxDiffStatus.UN_CHANGE:
                totalUnChanged++;
                break;
              case SchemaCtxDiffStatus.NEW:
                totalNews++;
                break;
              case SchemaCtxDiffStatus.DELETE:
                totalDeleted++;
                break;
            }
          }
        }
      }
      return {
        totalUnChanged,
        totalNews,
        totalDeleted,
      };
    } catch (error) {
      this.logger.error(
        `[CountDiffSchemaCtxStep] Error counting diff schema context: `,
        error.message
      );
      throw new Error("Error counting diff schema context");
    }
  }
}
