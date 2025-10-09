import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenSemanticFlagsStep {
  run(data: {
    question: string;
    query: string;
  }): Promise<{ flags: { flag: string; purpose: string }[] } | []>;
}

export class GenSemanticFlagsStep implements IGenSemanticFlagsStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: {
    question: string;
    query: string;
  }): Promise<{ flags: { flag: string; purpose: string }[] }> {
    try {
      this.logger.info(
        `[GenSemanticFlagsStep] Running semantic flags generation from topology`,
        data
      );
      // 1. Validate input
      if (!data.question || data.question.trim() === "") {
        this.logger.error(
          `[GenSemanticFlagsStep] Invalid input question: ${data?.question}`
        );
        throw new Error("Invalid input question");
      }
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenSemanticFlagsStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }
      // 2. Generate semantic flags using the generation port
      const response = await this.genTopoPort.genFlags({
        question: data.question,
        query: data.query,
      });
      this.logger.info(
        `[GenSemanticFlagsStep] Generated semantic flags: ${JSON.stringify(
          response?.flags
        )}`
      );
      return response
        ? {
            flags: response.flags.map((f: any) => ({
              flag: f.flag,
              purpose: f.purpose ?? "", // Provide a default or map accordingly
            })),
          }
        : { flags: [] };
    } catch (error) {
      this.logger.error(`[GenSemanticFlagsStep] Error: ${error.message}`);
      throw new Error(`[GenSemanticFlagsStep] Error: ${error.message}`);
    }
  }
}
