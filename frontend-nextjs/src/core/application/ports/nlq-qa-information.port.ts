import {
  TNlqInfoConnDto,
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
    connection: TNlqInfoConnDto,
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData>;
}
