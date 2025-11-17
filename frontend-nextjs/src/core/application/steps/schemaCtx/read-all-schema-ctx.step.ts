import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IReadAllSchemaCtxStep {
  run(): Promise<TSchemaCtxBaseDto[]>;
}

export class ReadAllSchemaCtxStep implements IReadAllSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepo: ISchemaCtxRepository
  ) {}

  async run(): Promise<TSchemaCtxBaseDto[]> {
    try {
      this.logger.info(`[ReadAllSchemaCtxStep] Reading all schema contexts`);
      const schemaCtxs = await this.schemaCtxRepo.findAll();
      return schemaCtxs;
    } catch (error) {
      this.logger.error(
        `[ReadAllSchemaCtxStep] Error reading all schema contexts: `,
        error.message
      );
      throw new Error(error.message || "Error reading all schema contexts");
    }
  }
}
