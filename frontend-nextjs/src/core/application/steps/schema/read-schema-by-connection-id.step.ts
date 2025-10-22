import { TSchemaOutRqDto } from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface IReadSchemaByConnIdStep {
  run(connId: string): Promise<TSchemaOutRqDto | null>;
}

export class ReadSchemaByConnIdStep implements IReadSchemaByConnIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}

  async run(connId: string): Promise<TSchemaOutRqDto | null> {
    try {
      if (!connId) {
        throw new Error("Connection ID is required");
      }
      return await this.schemaRepo.findByConnId(connId);
    } catch (error) {
      this.logger.error(
        "[ReadByConnIdStep] Error reading schema by connection ID:",
        error.message
      );
      throw new Error(error.message || "Error reading schema by connection ID");
    }
  }
}
