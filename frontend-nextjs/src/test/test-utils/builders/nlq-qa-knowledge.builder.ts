// test-utils/builders/nlqQaKnowledge.builder.ts
import {
  TCreateNlqQaKnowledgeDto,
  TUpdateNlqQaKnowledgeDto,
  TNlqQaKnowledgeInRequestDto,
  TNlqQaKnowledgeOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";

const defaultVector = (n = 8): number[] =>
  Array.from({ length: n }, (_, i) => +Math.sin(i + 1).toFixed(6));

export class NlqQaKnowledgeBuilder {
  /** Entrada “completa” (lo que tendrías persistido / retornado) */
  static makeOut(
    overrides: Partial<TNlqQaKnowledgeOutRequestDto> = {}
  ): TNlqQaKnowledgeOutRequestDto {
    return {
      id: "kn-1",
      nlqQaGoodId: "good-1",
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      tablesColumns: ["invoices.id", "invoices.created_at"],
      // values: defaultVector(16), // opcional
      score: 0.92,
      ...overrides,
    };
  }

  /** DTO de creación (sin score) */
  static makeCreate(
    overrides: Partial<TCreateNlqQaKnowledgeDto> = {}
  ): TCreateNlqQaKnowledgeDto {
    return {
      id: "kn-1",
      nlqQaGoodId: "good-1",
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      tablesColumns: ["invoices.id", "invoices.created_at"],
      // values: defaultVector(16),
      ...overrides,
    };
  }

  /** DTO de update (mismo shape que create en tu esquema) */
  static makeUpdate(
    overrides: Partial<TUpdateNlqQaKnowledgeDto> = {}
  ): TUpdateNlqQaKnowledgeDto {
    return {
      id: "kn-1",
      nlqQaGoodId: "good-1",
      question: "Updated question",
      query: "SELECT * FROM invoices",
      tablesColumns: ["invoices.id"],
      // values: defaultVector(16),
      ...overrides,
    };
  }

  /** Entrada “in request” con todos los campos (incluye score) */
  static makeInRequest(
    overrides: Partial<TNlqQaKnowledgeInRequestDto> = {}
  ): TNlqQaKnowledgeInRequestDto {
    return {
      id: "kn-1",
      nlqQaGoodId: "good-1",
      question: "How many invoices were created last month?",
      query:
        "SELECT COUNT(*) FROM invoices WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
      tablesColumns: ["invoices.id", "invoices.created_at"],
      values: defaultVector(16),
      score: 0.9,
      ...overrides,
    };
  }

  /** Lista de conocimientos (útil para tests que esperan arrays) */
  static makeList(
    count = 2,
    itemOverrides: Partial<TNlqQaKnowledgeOutRequestDto> = {}
  ): TNlqQaKnowledgeOutRequestDto[] {
    return Array.from({ length: count }, (_, i) =>
      this.makeOut({
        id: `kn-${i + 1}`,
        nlqQaGoodId: `good-${i + 1}`,
        // score: +(0.8 + i * 0.05).toFixed(2),
        ...itemOverrides,
      })
    );
  }
}
