import { TSchemaCtxKnowledgeGraphOutRq } from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxKnowledgeGraphRepository } from "../../interfaces/schema/schema.inter";

export interface IReadAllSchemaStep {
  run(): Promise<TSchemaCtxKnowledgeGraphOutRq[]>;
}

export class ReadAllSchemaStep implements IReadAllSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaCtxKnowledgeGraphRepository
  ) {}
  async run(): Promise<TSchemaCtxKnowledgeGraphOutRq[]> {
    try {
      this.logger.info("[ReadAllSchemaStep] Reading all schemas");
      const schemas = await this.schemaRepo.findAllSchemaCtxKnowledgeGraph();
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
