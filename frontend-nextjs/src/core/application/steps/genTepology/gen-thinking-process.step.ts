export interface IGenThinkingProcessStep {
  run(data: { question: string; query: string }): Promise<{ think: string }>;
}

import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export class GenThinkingProcessStep implements IGenThinkingProcessStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: {
    question: string;
    query: string;
  }): Promise<{ think: string }> {
    try {
      this.logger.info(
        `[GenThinkingProcessStep] Running thinking process generation from topology`,
        data
      );
      // 1. Validate input
      if (!data.question || data.question.trim() === "") {
        this.logger.error(
          `[GenThinkingProcessStep] Invalid input question: ${data?.question}`
        );
        throw new Error("Invalid input question");
      }
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenThinkingProcessStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }
      // 2. Generate thinking process using the generation port
      const response = await this.genTopoPort.genThinkProcess({
        question: data.question,
        query: data.query,
      });
      this.logger.info(
        `[GenThinkingProcessStep] Generated thinking process: ${JSON.stringify(
          response?.think
        )}`
      );
      return { think: response?.think || "" };
    } catch (error) {
      this.logger.error(`[GenThinkingProcessStep] Error: ${error.message}`);
      throw new Error(`[GenThinkingProcessStep] Error: ${error.message}`);
    }
  }
}
