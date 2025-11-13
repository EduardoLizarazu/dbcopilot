// test-utils/builders/nlqQaGeneration.builder.ts

import {
  TCreateNlqQaGenerationPromptTemplate,
  TNlqQaGenerationOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-generation.dto";

export class NlqQaGenerationBuilder {
  /**
   * Construye un objeto para el prompt template (entrada a la generación de query)
   */
  static makePromptTemplate(
    overrides: Partial<TCreateNlqQaGenerationPromptTemplate> = {}
  ): TCreateNlqQaGenerationPromptTemplate {
    return {
      question: "How many orders last month?",
      similarKnowledgeBased: [
        {
          id: "k1",
          nlqQaGoodId: "nlg1",
          question: "How many customers this year?",
          query: "SELECT COUNT(*) FROM customers",
          tablesColumns: ["customers.id"],
          score: 0.85,
        },
      ],
      schemaBased: [
        {
          TABLE_SCHEMA: "public",
          TABLE_NAME: "orders",
          COLUMN_NAME: "id",
          DATA_TYPE: "number",
          DATA_LENGTH: 10,
          DATA_PRECISION: 10,
          DATA_SCALE: 0,
          NULLABLE: "NO",
          IS_PRIMARY_KEY: "YES",
          IS_FOREIGN_KEY: "NO",
          REFERENCED_TABLE_SCHEMA: null,
          REFERENCED_TABLE_NAME: null,
          REFERENCED_COLUMN_NAME: null,
        },
      ],
      ...overrides,
    };
  }

  /**
   * Construye un objeto de salida de la generación de query (lo que devuelve el modelo)
   */
  static makeOut(
    overrides: Partial<TNlqQaGenerationOutRequestDto> = {}
  ): TNlqQaGenerationOutRequestDto {
    return {
      answer:
        "SQL: SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      ...overrides,
    };
  }
}
