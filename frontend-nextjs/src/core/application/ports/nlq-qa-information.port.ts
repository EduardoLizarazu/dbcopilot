import {
  TNlqInfoConnDto,
  TNlqInfoExtractorDto,
  TNlqInformationData,
  TNlqQaInformationSchemaExtractionDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export interface INlqQaInformationPort {
  extractSchemaBased(
    tables: string[]
  ): Promise<TNlqQaInformationSchemaExtractionDto>;
  extractSchemaFromConnection(
    connection: TNlqInfoConnDto
  ): Promise<TNlqQaInformationSchemaExtractionDto>;
  executeQuery(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData>;
  executeQueryFromConnection(
    data: TNlqInfoExtractorDto,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData>;
}
