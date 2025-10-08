import { TNlqInformationData } from "../../dtos/nlq/nlq-qa-information.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "../../interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface IExecuteQueryStep {
  run(data: { query: string }): Promise<TNlqInformationData>;
}

export class ExecuteQueryStep implements IExecuteQueryStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqInfoPort: INlqQaInformationPort
  ) {}

  async run(data: { query: string }): Promise<TNlqInformationData> {
    try {
      // 1. Validate input
      if (!data.query || data.query.trim() === "") {
        this.logger.error(`[ExecuteQueryStep] Invalid input: ${data.query}`);
        throw new Error("Invalid input");
      }

      //   2. Execute query
      const response = await this.nlqInfoPort.executeQuery(data.query);

      return response;
    } catch (error) {
      this.logger.error(
        `[ExecuteQueryStep] Error occurred while executing query: ${error.message}`
      );
      throw new Error("Error executing query: " + error.message);
    }
  }
}
