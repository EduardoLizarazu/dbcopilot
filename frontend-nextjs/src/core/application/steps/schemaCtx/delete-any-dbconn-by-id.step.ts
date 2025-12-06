import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IDeleteAnyDbConnectionFromSchemaCtxStep {
  run(data: { dbConnId: string }): Promise<void>;
}

export class DeleteAnyDbConnectionFromSchemaCtxStep
  implements IDeleteAnyDbConnectionFromSchemaCtxStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepository: ISchemaCtxRepository
  ) {}

  async run(data: { dbConnId: string }): Promise<void> {
    try {
      this.logger.info(
        `[DeleteAnyDbConnectionFromSchemaCtxStep] Deleting DB connection from schema context with id: `,
        data
      );
      // Check if dbConnId is provided
      if (!data?.dbConnId) {
        this.logger.error(
          `[DeleteAnyDbConnectionFromSchemaCtxStep] DB Connection ID is required`,
          data
        );
        throw new Error("DB Connection ID is required");
      }

      // Get all schema contexts
      const schemaContexts = await this.schemaCtxRepository.findAll();
      if (!schemaContexts || schemaContexts.length === 0) {
        this.logger.info(
          `[DeleteAnyDbConnectionFromSchemaCtxStep] No schema contexts found`
        );
        return;
      }

      // Iterate through each schema context and delete the db connection if it exists
      for (const schemaCtx of schemaContexts) {
        const dbConns = schemaCtx.dbConnectionIds || [];
        const dbConnIndex = dbConns.findIndex(
          (connId) => connId === data.dbConnId
        );
        if (dbConnIndex !== -1) {
          dbConns.splice(dbConnIndex, 1);
          await this.schemaCtxRepository.update(schemaCtx.id, {
            dbConnectionIds: dbConns,
          });
        }
      }
      this.logger.info(
        `[DeleteAnyDbConnectionFromSchemaCtxStep] Successfully deleted DB connection from schema context with id: `,
        data
      );
    } catch (error) {
      this.logger.error(
        `[DeleteAnyDbConnectionFromSchemaCtxStep] Error deleting DB connection from schema context with id: `,
        error.message
      );
      throw new Error(
        error.message || "Error deleting DB connection from schema context"
      );
    }
  }
}
