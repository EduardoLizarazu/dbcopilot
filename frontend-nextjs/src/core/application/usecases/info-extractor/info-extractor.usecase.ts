import {
  nlqInfoExtractorSchema,
  TNlqInfoExtractorDto,
  TNlqInformationData,
} from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface INlqQaInfoExtractorUseCase {
  execute(
    data: TNlqInfoExtractorDto
  ): Promise<TResponseDto<TNlqInformationData>>;
}

export class NlqQaInfoExtractorUseCase implements INlqQaInfoExtractorUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaInformationPort: INlqQaInformationPort
  ) {}

  async execute(
    data: TNlqInfoExtractorDto
  ): Promise<TResponseDto<TNlqInformationData>> {
    try {
      const validData = await nlqInfoExtractorSchema.safeParseAsync(data);
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

      const result = await this.nlqQaInformationPort.executeQueryFromConnection(
        validData.data
      );

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
