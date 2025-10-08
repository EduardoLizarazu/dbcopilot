import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IExtractQueryFromGenQueryStep {
  run(data: { unCleanQuery: string }): Promise<{ query: string }>;
}

export class ExtractQueryFromGenQueryStep
  implements IExtractQueryFromGenQueryStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenPort: INlqQaQueryGenerationPort
  ) {}

  async run(data: { unCleanQuery: string }): Promise<{ query: string | null }> {
    try {
      this.logger.info(
        `[ExtractQueryFromGenQueryStep] Extracting query from generation response`
      );

      //   1. Validate input
      if (!data.unCleanQuery || data.unCleanQuery.trim() === "") {
        this.logger.error(
          `[ExtractQueryFromGenQueryStep] Invalid input: ${data.unCleanQuery}`
        );
        throw new Error("Invalid input");
      }

      //   2. Extract query using the generation port
      const response =
        await this.nlqQaQueryGenPort.extractQueryFromGenerationResponse(
          data.unCleanQuery
        );
      this.logger.info(
        `[ExtractQueryFromGenQueryStep] Extracted query: ${response?.query}`
      );

      return { query: response?.query ? response.query : null };
    } catch (error) {
      this.logger.error(
        `[ExtractQueryFromGenQueryStep] Error: ${error.message}`
      );
      throw new Error(
        "Error extracting query from generation response: " + error.message
      );
    }
  }
}
