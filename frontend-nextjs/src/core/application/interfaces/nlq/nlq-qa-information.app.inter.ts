import {
  TNlqInformationData,
  TNlqQaInformationSchemaExtractionDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export interface INlqQaInformationRepository {
  extractSchemaBased(
    tables: string[]
  ): Promise<TNlqQaInformationSchemaExtractionDto>;
  executeQuery(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData>;
}
