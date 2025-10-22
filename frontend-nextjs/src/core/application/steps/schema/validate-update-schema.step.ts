import {
  TUpdateSchemaCtxKnowledgeGraphInRq,
  updateSchemaCtxKnowledgeGraphInRq,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IValidateUpdateSchemaStep {
  run(
    data: TUpdateSchemaCtxKnowledgeGraphInRq
  ): Promise<TUpdateSchemaCtxKnowledgeGraphInRq>;
}

export class ValidateUpdateSchemaStep implements IValidateUpdateSchemaStep {
  constructor(private readonly logger: ILogger) {}
  async run(
    data: TUpdateSchemaCtxKnowledgeGraphInRq
  ): Promise<TUpdateSchemaCtxKnowledgeGraphInRq> {
    try {
      this.logger.info(
        "[ValidateUpdateSchemaStep] Running validation...",
        JSON.stringify(data)
      );
      //   1. Validate required fields
      const vData =
        await updateSchemaCtxKnowledgeGraphInRq.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[ValidateUpdateSchemaStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }
      return vData.data;
    } catch (error) {
      this.logger.error("[ValidateUpdateSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in ValidateUpdateSchemaStep");
    }
  }
}
