import { TNlqQaInformationSchemaExtractionDto } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaInformationExtractSchemaBasedUseCase {
  execute(
    tables: string[]
  ): Promise<TResponseDto<TNlqQaInformationSchemaExtractionDto>>;
}
