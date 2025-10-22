import {
  createSchemaCtxKnowledgeGraphInRq,
  TCreateSchemaCtxKnowledgeGraphInRq,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IValidateCreateSchemaStep {
  run(
    data: TCreateSchemaCtxKnowledgeGraphInRq
  ): Promise<TCreateSchemaCtxKnowledgeGraphInRq>;
}

export class ValidateCreateNlqQaStep implements IValidateCreateSchemaStep {
  constructor(private readonly logger: ILogger) {}
  async run(
    data: TCreateSchemaCtxKnowledgeGraphInRq
  ): Promise<TCreateSchemaCtxKnowledgeGraphInRq> {
    try {
      this.logger.info(
        "[ValidateCreateNlqQaStep] Running validation...",
        JSON.stringify(data)
      );
      //   1. Validate required fields
      const vData =
        await createSchemaCtxKnowledgeGraphInRq.safeParseAsync(data);

      if (!vData.success) {
        this.logger.error(
          "[ValidateCreateNlqQaStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }

      this.logger.info(
        "[ValidateCreateNlqQaStep] Validation succeeded:",
        JSON.stringify(vData.data)
      );

      return vData.data;
    } catch (error) {
      this.logger.error("[ValidateCreateNlqQaStep] Error:", error.message);
      throw new Error(error.message || "Error in validation");
    }
  }
}
