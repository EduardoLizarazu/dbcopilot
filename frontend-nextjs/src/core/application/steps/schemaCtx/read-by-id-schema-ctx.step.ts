import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IReadByIdSchemaCtxStep {
  run(id: string): Promise<TSchemaCtxBaseDto | null>;
}

export class ReadByIdSchemaCtxStep implements IReadByIdSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepo: ISchemaCtxRepository
  ) {}

  async run(id: string): Promise<TSchemaCtxBaseDto | null> {
    try {
      this.logger.info(
        `[ReadByIdSchemaCtxStep] Reading schema context by id: ${id}`
      );
      if (!id) throw new Error("Schema context ID is required");

      const schemaCtx = await this.schemaCtxRepo.findById(id);
      return schemaCtx;
    } catch (error) {
      this.logger.error(
        `[ReadByIdSchemaCtxStep] Error reading schema context by id: `,
        error.message
      );
      throw new Error(error.message || "Error reading schema context by id");
    }
  }
}
