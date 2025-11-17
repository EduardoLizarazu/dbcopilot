import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IDeleteSchemaCtxStep {
  execute(id: string): Promise<void>;
}

export class DeleteSchemaCtxStep implements IDeleteSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepository: ISchemaCtxRepository
  ) {}

  async execute(id: string): Promise<void> {
    try {
      this.logger.info(
        `[DeleteSchemaCtxStep] Deleting schema context with id ${id}`
      );
      if (!id) throw new Error("Schema context id is required");

      await this.schemaCtxRepository.delete(id);

      return;
    } catch (error) {
      this.logger.error(
        `[DeleteSchemaCtxStep] Error deleting schema context with id ${id}: `,
        error.message
      );
      throw new Error(error.message || "Error deleting schema context");
    }
  }
}
