import {
  TNlqInfoConnDto,
  TNlqInfoExtractorDto,
  TNlqInformationData,
  TNlqQaInformationSchemaExtractionDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import {
  TSchemaCtxColumnProfileDto,
  TSchemaCtxSchemaDto,
} from "../dtos/schemaCtx.dto";

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
  extractProfile(data: {
    connection: TNlqInfoConnDto;
    schema: {
      schemaName: string;
      tableName: string;
      columnName: string;
      dataType: string;
    };
    top: number;
  }): Promise<TSchemaCtxColumnProfileDto | null>;
}
