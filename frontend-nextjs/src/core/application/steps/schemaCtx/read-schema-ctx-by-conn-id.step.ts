import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IReadSchemaCtxByConnIdStep {
  run(data: { connId: string }): Promise<TSchemaCtxBaseDto>;
}

export class ReadSchemaCtxByConnIdStep implements IReadSchemaCtxByConnIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepo: ISchemaCtxRepository
  ) {}
  async run(data: { connId: string }): Promise<TSchemaCtxBaseDto> {
    try {
      this.logger.info(
        `[ReadSchemaCtxByConnIdStep] - execute - Start for connId: ${data.connId}`
      );
      if (!data?.connId) {
        throw new Error("Connection ID is required");
      }

      // Get all schema contexts
      const allSchemaCtxResult = await this.schemaCtxRepo.findAll();
      this.logger.info(
        `[ReadSchemaCtxByConnIdStep] - execute - Retrieved ${allSchemaCtxResult.length} schema contexts`
      );

      // On iterate over and schema contexts, and iterate over their dbConnectionIds to find a match with data.connId
      for (const schemaCtx of allSchemaCtxResult) {
        this.logger.info(
          `[ReadSchemaCtxByConnIdStep] - execute - Checking schema context with ID: ${schemaCtx.id} and dbConnectionIds: ${schemaCtx.dbConnectionIds}`,
          schemaCtx?.name
        );
        if (schemaCtx?.dbConnectionIds?.includes(data.connId)) {
          this.logger.info(
            `[ReadSchemaCtxByConnIdStep] - execute - Found schema context for connId: ${data.connId}`
          );
          return schemaCtx;
        }
      }

      this.logger.info(
        `[ReadSchemaCtxByConnIdStep] - execute - No schema context found for connId: ${data.connId}`
      );
      return null;
    } catch (error) {
      this.logger.error(
        `[ReadSchemaCtxByConnIdStep] - execute - Error reading schema context for connection ID ${data.connId}:`,
        error.message || error || "Unknown error"
      );
      throw new Error(error.message || "Error reading schema context");
    }
  }
}
