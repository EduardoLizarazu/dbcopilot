import { INlqQaInformationRepository } from "@/core/application/interfaces/nlq/nlq-qa-information.app.inter";
import { INlqQaInformationExtractSchemaBasedUseCase } from "../../interfaces/nlq-qa-information/nlq-qa-information-extract-schema-based.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TNlqQaInformationSchemaExtractionDto } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export class NlqQaInformationExtractSchemaBasedUseCase
  implements INlqQaInformationExtractSchemaBasedUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaInformationRepository: INlqQaInformationRepository
  ) {}
  async execute(
    tables: string[] = []
  ): Promise<TResponseDto<TNlqQaInformationSchemaExtractionDto>> {
    try {
      const schemaInfo =
        await this.nlqQaInformationRepository.extractSchemaBased(tables);
      this.logger.info(
        `[NlqQaInformationExtractSchemaBasedUseCase] Schema information extracted: ${JSON.stringify(
          schemaInfo
        )}`
      );
      return {
        success: true,
        message: "Schema information extracted successfully",
        data: schemaInfo,
      };
    } catch (error) {
      this.logger.error(
        `[NlqQaInformationExtractSchemaBasedUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error extracting schema information",
        data: null,
      };
    }
  }
}
