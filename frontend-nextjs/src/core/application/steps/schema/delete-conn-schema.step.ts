import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface IDeleteConnSchemaStep {
  run(connId: string): Promise<void>;
}

export class DeleteConnSchemaStep implements IDeleteConnSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}
  async run(connId: string): Promise<void> {
    try {
      this.logger.info(
        "[DeleteConnSchemaStep] Deleting connection from schema:",
        { connId }
      );
      //   1. Validate input
      if (!connId) {
        throw new Error("Input data is missing");
      }

      //   2. Find schema by connection ID
      const schema = await this.schemaRepo.findByConnId(connId);
      if (!schema) {
        this.logger.info(
          "[DeleteConnSchemaStep] No schema found for the given connection ID:",
          { connId }
        );
        return; // Exit if no schema found
      }

      await this.schemaRepo.deleteConnOnSchema(schema.id, connId);
    } catch (error) {
      this.logger.error(
        "[DeleteConnSchemaStep] Error deleting connection from schema:",
        error.message
      );
      throw new Error(error.message || "Error deleting connection from schema");
    }
  }
}
