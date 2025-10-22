import {
  TSchemaCtxKnowledgeGraphOutRq,
  TUpdateSchemaCtxKnowledgeGraphInRq,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxKnowledgeGraphRepository } from "../../interfaces/schema/schema.inter";

export interface IUpdateSchemaStep {
  run(
    id: string,
    data: TUpdateSchemaCtxKnowledgeGraphInRq
  ): Promise<TSchemaCtxKnowledgeGraphOutRq>;
}

export class UpdateSchemaStep implements IUpdateSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaCtxKnowledgeGraphRepository
  ) {}

  async run(
    id: string,
    data: TUpdateSchemaCtxKnowledgeGraphInRq
  ): Promise<TSchemaCtxKnowledgeGraphOutRq> {
    try {
      this.logger.info(
        `[UpdateSchemaStep] Updating schema with ID: ${id}`,
        JSON.stringify(data)
      );
      await this.schemaRepo.updateSchemaCtxKnowledgeGraph(id, data);
      this.logger.info("[UpdateSchemaStep] Update successful");
      const updatedDoc =
        await this.schemaRepo.findSchemaCtxKnowledgeGraphById(id);

      if (!updatedDoc) {
        this.logger.error(
          "[UpdateSchemaStep] Schema not found after update:",
          id
        );
        throw new Error("Schema not found after update");
      }

      return updatedDoc;
    } catch (error) {
      this.logger.error("[UpdateSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in UpdateSchemaStep");
    }
  }
}
