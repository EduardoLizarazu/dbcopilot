import {
  connDto,
  TNlqInfoConnDto,
  TNlqInformationData,
} from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface IExtractSchemaDbConnectionUseCase {
  execute(
    connection: TNlqInfoConnDto
  ): Promise<TResponseDto<TNlqInformationData>>;
}

export class ExtractSchemaDbConnectionUseCase
  implements IExtractSchemaDbConnectionUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly infoRepo: INlqQaInformationPort
  ) {}
  async execute(
    connection: TNlqInfoConnDto
  ): Promise<TResponseDto<TNlqInformationData>> {
    try {
      this.logger.info(
        "Executing ExtractSchemaDbConnectionUseCase",
        connection
      );

      const validConn = await connDto.safeParseAsync(connection);
      if (!validConn.success) {
        this.logger.warn(
          "[ExtractSchemaDbConnectionUseCase] Invalid connection data",
          validConn.error.errors
        );
        return {
          success: false,
          data: null,
          message: validConn.error.errors.map((e) => e.message).join(", "),
        };
      }

      const result = await this.infoRepo.extractSchemaFromConnection(
        validConn.data
      );

      if (!result) {
        this.logger.warn(
          "[ExtractSchemaDbConnectionUseCase] No schema found",
          connection
        );
        return {
          success: false,
          data: null,
          message: "No schema found",
        };
      }

      return {
        success: true,
        data: { data: result },
        message: "Schema extracted successfully",
      };
    } catch (error) {
      this.logger.error(
        "[ExtractSchemaDbConnectionUseCase] Error executing use case:",
        error.message
      );
      return {
        success: false,
        data: null,
        message: error.message || "Error extracting schema from connection",
      };
    }
  }
}
