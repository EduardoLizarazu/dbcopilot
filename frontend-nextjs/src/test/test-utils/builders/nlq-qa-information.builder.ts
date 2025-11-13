// test-utils/builders/nlqQaInformation.builder.ts
import {
  TNlqQaInformationSchemaExtractionDto,
  TNlqInformationData,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export class NlqQaInformationBuilder {
  /**
   * Construye un esquema de extracción (array de columnas de BD)
   */
  static makeSchemaExtraction(
    overrides: Partial<TNlqQaInformationSchemaExtractionDto[number]> = {}
  ): TNlqQaInformationSchemaExtractionDto {
    return [
      {
        TABLE_SCHEMA: "TMPRD",
        TABLE_NAME: "CT1300",
        COLUMN_NAME: "T1_CUSTRANS",
        DATA_TYPE: "NUMBER",
        DATA_LENGTH: 22,
        DATA_PRECISION: 38,
        DATA_SCALE: 0,
        NULLABLE: "Y",
        IS_PRIMARY_KEY: "FALSE",
        IS_FOREIGN_KEY: "FALSE",
        REFERENCED_TABLE_SCHEMA: null,
        REFERENCED_TABLE_NAME: null,
        REFERENCED_COLUMN_NAME: null,
        ...overrides,
      },
    ];
  }

  /**
   * Construye un objeto simulado de datos devueltos por executeQuery
   */
  static makeInformationData(
    overrides: Partial<TNlqInformationData> = {}
  ): TNlqInformationData {
    return {
      data: [
        { T1_CUSTRANS: 100, CUSTOMER_NAME: "John Doe" },
        { T1_CUSTRANS: 200, CUSTOMER_NAME: "Jane Smith" },
      ],
      ...overrides,
    };
  }
}
