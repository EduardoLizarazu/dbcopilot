import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IPolicySafeUnMutableQueryStep {
  run(data: { query: string }): Promise<{ safeQuery: String; isSafe: boolean }>;
}

export class PolicySafeUnMutableQueryStep
  implements IPolicySafeUnMutableQueryStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly genPort: INlqQaQueryGenerationPort
  ) {}

  async run(data: {
    query: string;
  }): Promise<{ safeQuery: String; isSafe: boolean }> {
    try {
      this.logger.info(
        `[PolicySafeUnMutableQueryStep] Running policy safe unmutable query`
      );

      // 1. Validate input
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[PolicySafeUnMutableQueryStep] Invalid input: ${data.query}`
        );
        throw new Error("Invalid input");
      }

      // 2. Generate safe query using the generation port
      const response = await this.genPort.safeQuery(data.query);

      return { safeQuery: response?.query, isSafe: response?.isSafe };
    } catch (error) {
      this.logger.error(
        `[PolicySafeUnMutableQueryStep] Error: ${error.message}`
      );
      throw new Error("Error generating safe query: " + error.message);
    }
  }
}
