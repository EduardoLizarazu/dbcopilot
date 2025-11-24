import { TSchemaCtxSchemaDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IMergeSchemaCtxsStep {
  run(data: {
    schemaCtxFromDb: TSchemaCtxSchemaDto[];
    schemaCtx: TSchemaCtxSchemaDto[];
  }): Promise<TSchemaCtxSchemaDto[]>;
}

export class MergeSchemaCtxsStep implements IMergeSchemaCtxsStep {
  constructor(private readonly logger: ILogger) {}

  async run(data: {
    schemaCtxFromDb: TSchemaCtxSchemaDto[];
    schemaCtx: TSchemaCtxSchemaDto[];
  }): Promise<TSchemaCtxSchemaDto[]> {
    try {
      const { schemaCtxFromDb, schemaCtx } = data;
      this.logger.info(
        `[MergeSchemaCtxsStep] Merging schema context data from DB and existing schema context:`,
        data
      );

      if (!Array.isArray(schemaCtxFromDb)) {
        this.logger.warn(
          "[MergeSchemaCtxsStep] schemaCtxFromDb no es un array, devolviendo schemaCtx tal cual"
        );
        return schemaCtx ?? [];
      }

      const previousSchemas = schemaCtx ?? [];

      const mergedSchemas: TSchemaCtxSchemaDto[] = schemaCtxFromDb.map(
        (schemaFromDb) => {
          const existingSchema = previousSchemas.find(
            (s) => s.id && schemaFromDb.id && s.id === schemaFromDb.id
          );

          // Estructura manda DB; metadata (description, aliases) manda schemaCtx
          const mergedSchema: TSchemaCtxSchemaDto = {
            ...schemaFromDb,
            ...(existingSchema && {
              description: existingSchema.description,
              aliases: existingSchema.aliases,
            }),
          };

          const tablesFromDb = schemaFromDb.tables ?? [];
          const tablesFromExisting = existingSchema?.tables ?? [];

          mergedSchema.tables = tablesFromDb.map((tableFromDb) => {
            const existingTable = tablesFromExisting.find(
              (t) => t.id && tableFromDb.id && t.id === tableFromDb.id
            );

            const mergedTable = {
              ...tableFromDb,
              ...(existingTable && {
                description: existingTable.description,
                aliases: existingTable.aliases,
              }),
            };

            const columnsFromDb = tableFromDb.columns ?? [];
            const columnsFromExisting = existingTable?.columns ?? [];

            mergedTable.columns = columnsFromDb.map((columnFromDb) => {
              const existingColumn = columnsFromExisting.find(
                (c) => c.id && columnFromDb.id && c.id === columnFromDb.id
              );

              const mergedColumn = {
                ...columnFromDb,
                ...(existingColumn && {
                  description: existingColumn.description,
                  aliases: existingColumn.aliases,
                  profile: existingColumn.profile,
                }),
              };

              return mergedColumn;
            });

            return mergedTable;
          });

          return mergedSchema;
        }
      );

      this.logger.info(
        `[MergeSchemaCtxsStep] Merged schema context result:`,
        mergedSchemas
      );

      return mergedSchemas;
    } catch (error: any) {
      this.logger.error(
        `[MergeSchemaCtxWithRawSchemaStep] Error merging schema context with raw schema: `,
        error?.message || error
      );
      throw new Error(
        error?.message || "Error merging schema context with raw schema"
      );
    }
  }
}
