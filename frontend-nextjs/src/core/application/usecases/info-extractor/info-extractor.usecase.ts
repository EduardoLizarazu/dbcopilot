import {
  nlqInfoExtractorSchema,
  nlqQaInfoExtractorInRequestSchema,
  TNlqInfoExtractorDto,
  TNlqInformationData,
  TNlqQaInfoExtractorInRequestDto,
} from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface INlqQaInfoExtractorUseCase {
  execute(
    data: TNlqQaInfoExtractorInRequestDto
  ): Promise<TResponseDto<TNlqInformationData>>;
}

export class NlqQaInfoExtractorUseCase implements INlqQaInfoExtractorUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaInformationPort: INlqQaInformationPort,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async execute(
    data: TNlqQaInfoExtractorInRequestDto
  ): Promise<TResponseDto<TNlqInformationData>> {
    try {
      this.logger.info(
        "[NlqQaInfoExtractorUseCase] Executing with data:",
        data
      );
      // 1. Validate data
      const validData =
        await nlqQaInfoExtractorInRequestSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          "[NlqQaInfoExtractorUseCase] Invalid data:",
          validData.error.errors
        );
        return {
          success: false,
          message: "Invalid data",
          data: null,
        };
      }
      this.logger.info(
        "[NlqQaInfoExtractorUseCase] Valid data:",
        validData.data
      );

      // 2. Find by id connection db
      const connection = await this.dbConnRepo.findById(validData.data.connId);
      if (!connection) {
        this.logger.error(
          "[NlqQaInfoExtractorUseCase] Connection not found:",
          validData.data.connId
        );
        return {
          success: false,
          message: "Connection not found",
          data: null,
        };
      }
      this.logger.info(
        "[NlqQaInfoExtractorUseCase] Found connection:",
        connection
      );

      // 3. Prepare data for port
      const portData: TNlqInfoExtractorDto = {
        type: connection.type,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
        sid: connection.sid || null,
        query: validData.data.query,
      };

      // 4. Validate port data
      const validPortData =
        await nlqInfoExtractorSchema.safeParseAsync(portData);
      if (!validPortData.success) {
        this.logger.error(
          "[NlqQaInfoExtractorUseCase] Invalid port data:",
          validPortData.error.errors
        );
        return {
          success: false,
          message: "Invalid port data",
          data: null,
        };
      }
      this.logger.info(
        "[NlqQaInfoExtractorUseCase] Valid port data:",
        validPortData.data
      );

      // 5. Execute query from connection
      const result = await this.nlqQaInformationPort.executeQueryFromConnection(
        validPortData.data
      );

      this.logger.info(
        "[NlqQaInfoExtractorUseCase] Query executed successfully:",
        result?.data?.length
      );

      // 6. Return result
      return {
        success: true,
        message: "Query executed successfully",
        data: result,
      };
    } catch (error) {
      this.logger.error(
        "[NlqQaInfoExtractorUseCase] Error executing query:",
        error.message
      );
      return {
        success: false,
        message: "Error executing query",
        data: null,
      };
    }
  }
}
