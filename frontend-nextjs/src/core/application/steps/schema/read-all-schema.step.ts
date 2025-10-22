import { TSchemaOutRqDto } from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface IReadAllSchemaStep {
  run(): Promise<TSchemaOutRqDto[]>;
}

export class ReadAllSchemaStep implements IReadAllSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}
  async run(): Promise<TSchemaOutRqDto[]> {
    try {
      this.logger.info("[ReadAllSchemaStep] Reading all schemas");
      const schemas = await this.schemaRepo.findAll();
      this.logger.info(
        "[ReadAllSchemaStep] Retrieved schemas:",
        JSON.stringify(schemas)
      );
      return schemas;
    } catch (error) {
      this.logger.error("[ReadAllSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in ReadAllSchemaStep");
    }
  }
}
