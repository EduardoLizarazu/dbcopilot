import {
  createSchemaCtxKnowledgeGraphInRq,
  TCreateSchemaCtxKnowledgeGraphInRq,
  TSchemaCtxKnowledgeGraphOutRq,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxKnowledgeGraphRepository } from "../../interfaces/schema/schema.inter";

export interface ICreateSchemaStep {
  run(
    data: TCreateSchemaCtxKnowledgeGraphInRq
  ): Promise<TSchemaCtxKnowledgeGraphOutRq>;
}

export class CreateSchemaStep implements ICreateSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaCtxKnowledgeGraphRepository
  ) {}

  async run(
    data: TCreateSchemaCtxKnowledgeGraphInRq
  ): Promise<TSchemaCtxKnowledgeGraphOutRq> {
    try {
      this.logger.info(
        "[CreateSchemaStep] Creating schema:",
        JSON.stringify(data)
      );

      // 1. Validate
      const vData =
        await createSchemaCtxKnowledgeGraphInRq.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[CreateSchemaStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }

      //   1. Create the schema context knowledge graph
      const schemaId = await this.schemaRepo.createSchemaCtxKnowledgeGraph(
        vData.data
      );

      this.logger.info("[CreateSchemaStep] Created schema with ID:", schemaId);

      //   2. Return the newly created schema ID
      const newDoc =
        await this.schemaRepo.findSchemaCtxKnowledgeGraphById(schemaId);
      if (!newDoc) {
        this.logger.error("[CreateSchemaStep] Schema not found:", schemaId);
        throw new Error("Schema not found");
      }

      return newDoc;
    } catch (error) {
      this.logger.error("[CreateSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in CreateSchemaStep");
    }
  }
}
