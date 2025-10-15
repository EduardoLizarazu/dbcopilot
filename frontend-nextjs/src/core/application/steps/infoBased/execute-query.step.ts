import {
  nlqInfoExtractorSchema,
  TNlqInfoExtractorDto,
  TNlqInformationData,
} from "../../dtos/nlq/nlq-qa-information.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface IExecuteQueryStep {
  run(data: TNlqInfoExtractorDto): Promise<TNlqInformationData>;
}

export class ExecuteQueryStep implements IExecuteQueryStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqInfoPort: INlqQaInformationPort
  ) {}

  async run(data: TNlqInfoExtractorDto): Promise<TNlqInformationData> {
    try {
      this.logger.info(
        `[ExecuteQueryStep] Running with data:`,
        JSON.stringify(data)
      );

      // 1. Validate input
      const dataValid = await nlqInfoExtractorSchema.safeParseAsync(data);
      if (!dataValid.success) {
        this.logger.error(
          `[ExecuteQueryStep] Invalid input data: ${dataValid.error}`
        );
        throw new Error("Invalid input data: " + dataValid.error.message);
      }

      //   2. Execute query
      const response = await this.nlqInfoPort.executeQueryFromConnection(
        dataValid.data
      );

      this.logger.info(
        `[ExecuteQueryStep] Query executed successfully:`,
        JSON.stringify(response)
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[ExecuteQueryStep] Error occurred while executing query:`,
        JSON.stringify(error)
      );
      throw new Error(error.message || "Error executing query");
    }
  }
}
