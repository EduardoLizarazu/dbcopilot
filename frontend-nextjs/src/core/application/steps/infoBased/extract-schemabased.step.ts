import {
  connDto,
  TNlqInfoConnDto,
  TNlqQaInformationSchemaExtractionDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";

export interface IExtractSchemaBasedStep {
  run(
    connection: TNlqInfoConnDto
  ): Promise<TNlqQaInformationSchemaExtractionDto>;
}

export class ExtractSchemaBasedStep implements IExtractSchemaBasedStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqInfoPort: INlqQaInformationPort
  ) {}

  async run(
    connection: TNlqInfoConnDto
  ): Promise<TNlqQaInformationSchemaExtractionDto> {
    try {
      this.logger.info(
        `[ExtractSchemaBasedStep] Extracting schema based information...`,
        JSON.stringify(connection)
      );
      // 1. Validate connection
      const dataValid = await connDto.safeParseAsync(connection);
      if (!dataValid.success) {
        this.logger.error(
          `[ExtractSchemaBasedStep] Invalid connection data: ${dataValid.error}`
        );
        throw new Error("Invalid connection data: " + dataValid.error.message);
      }

      // 2. Extract schema based information
      const schemaBasedInfo =
        await this.nlqInfoPort.extractSchemaFromConnection(connection);

      this.logger.info(
        `[ExtractSchemaBasedStep] Successfully extracted schema based information.`,
        JSON.stringify(schemaBasedInfo)
      );
      return schemaBasedInfo;
    } catch (error) {
      this.logger.error(
        `[ExtractSchemaBasedStep] Error occurred while extracting schema based information: ${error.message}`
      );
      throw new Error(
        error.message || "Failed to extract schema based information."
      );
    }
  }
}
