// test-utils/builders/nlqQaGood.builder.ts
import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodInRequestDto,
  TNlqQaGoodOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

export class NlqQaGoodBuilder {
  /**
   * Crea un DTO válido para crear un NLQ QA Good
   */
  static makeCreate(
    overrides: Partial<TCreateNlqQaGoodDto> = {}
  ): TCreateNlqQaGoodDto {
    return {
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      originId: "origin-123",
      knowledgeSourceId: "ks-123",
      isOnKnowledgeSource: true,
      detailQuestion: "Count invoices created last month",
      think:
        "Identified invoices table and filtered by created_at in last month",
      tablesColumns: ["invoices.id", "invoices.created_at"],
      semanticFields: [
        { field: "created_at", purpose: "Filter by last month" },
      ],
      semanticTables: [{ table: "invoices", purpose: "Store invoices data" }],
      flags: [{ field: "D2_TIPODOC", flag: "07" }],
      isDelete: false,
      questionBy: "analyst-123",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Crea un DTO válido para el request de entrada
   */
  static makeInRequest(
    overrides: Partial<TNlqQaGoodInRequestDto> = {}
  ): TNlqQaGoodInRequestDto {
    return {
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      originId: "origin-123",
      questionBy: "analyst-123",
      createdBy: "user-123",
      ...overrides,
    };
  }

  /**
   * Crea un DTO válido para la salida completa
   */
  static makeOut(
    overrides: Partial<TNlqQaGoodOutRequestDto> = {}
  ): TNlqQaGoodOutRequestDto {
    return {
      id: "good-1",
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      originId: "origin-123",
      knowledgeSourceId: "ks-123",
      isOnKnowledgeSource: true,
      detailQuestion: "Count invoices created last month",
      think:
        "Identified invoices table and filtered by created_at in last month",
      tablesColumns: ["invoices.id", "invoices.created_at"],
      semanticFields: [
        { field: "created_at", purpose: "Filter by last month" },
      ],
      semanticTables: [{ table: "invoices", purpose: "Store invoices data" }],
      flags: [{ field: "D2_TIPODOC", flag: "07" }],
      isDelete: false,
      questionBy: "analyst-123",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
