import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenSemanticFieldsStep {
  run(data: {
    question: string;
    query: string;
  }): Promise<{ semanticFields: { field: string; purpose: string }[] } | []>;
}

export class GenSemanticFieldsStep implements IGenSemanticFieldsStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: {
    question: string;
    query: string;
  }): Promise<{ semanticFields: { field: string; purpose: string }[] }> {
    try {
      this.logger.info(
        `[GenSemanticFieldsStep] Running semantic fields generation from topology`,
        data
      );
      // 1. Validate input
      if (!data.question || data.question.trim() === "") {
        this.logger.error(
          `[GenSemanticFieldsStep] Invalid input question: ${data?.question}`
        );
        throw new Error("Invalid input question");
      }
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenSemanticFieldsStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }
      // 2. Generate semantic fields using the generation port
      const response = await this.genTopoPort.genSemanticFields({
        question: data.question,
        query: data.query,
      });
      this.logger.info(
        `[GenSemanticFieldsStep] Generated semantic fields: ${JSON.stringify(
          response?.semanticFields
        )}`
      );

      return { semanticFields: response?.semanticFields || [] };
    } catch (error) {
      this.logger.error(`[GenSemanticFieldsStep] Error: ${error.message}`);
      throw new Error(`[GenSemanticFieldsStep] Error: ${error.message}`);
    }
  }
}
