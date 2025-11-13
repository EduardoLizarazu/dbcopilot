import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenSemanticTableStep {
  run(data: {
    question: string;
    query: string;
  }): Promise<{ semanticTables: { table: string; purpose: string }[] } | []>;
}

export class GenSemanticTableStep implements IGenSemanticTableStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: {
    question: string;
    query: string;
  }): Promise<{ semanticTables: { table: string; purpose: string }[] }> {
    try {
      this.logger.info(
        `[GenSemanticTableStep] Running semantic tables generation from topology`,
        data
      );
      // 1. Validate input
      if (!data.question || data.question.trim() === "") {
        this.logger.error(
          `[GenSemanticTableStep] Invalid input question: ${data?.question}`
        );
        throw new Error("Invalid input question");
      }
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenSemanticTableStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }
      // 2. Generate semantic tables using the generation port
      const response = await this.genTopoPort.genSemanticTables({
        question: data.question,
        query: data.query,
      });
      this.logger.info(
        `[GenSemanticTableStep] Generated semantic tables: ${JSON.stringify(
          response?.semanticTables
        )}`
      );
      return { semanticTables: response?.semanticTables || [] };
    } catch (error) {
      this.logger.error(`[GenSemanticTableStep] Error: ${error.message}`);
      throw new Error(`[GenSemanticTableStep] Error: ${error.message}`);
    }
  }
}
