// test-utils/builders/nlqQaError.builder.ts
import {
  TCreateNlqQaErrorDto,
  TUpdateNlqQaErrorDto,
  TNlqQaErrorInRequestDto,
  TNlqQaErrorOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";

export class NlqQaErrorBuilder {
  static makeInRequest(
    overrides: Partial<TNlqQaErrorInRequestDto> = {}
  ): TNlqQaErrorInRequestDto {
    return {
      id: "err-1",
      question: "How many orders last month?",
      query: "SELECT COUNT(*) FROM orders",
      knowledgeSourceUsedId: ["k1"],
      errorMessage: "Generated SQL query is not safe",
      createdBy: "user-123",
      createdAt: new Date(),
      ...overrides,
    };
  }

  static makeCreateDto(
    overrides: Partial<TCreateNlqQaErrorDto> = {}
  ): TCreateNlqQaErrorDto {
    return {
      question: "How many orders last month?",
      query: "SELECT COUNT(*) FROM orders",
      knowledgeSourceUsedId: ["k1"],
      errorMessage: "Generated SQL query is not safe",
      createdBy: "user-123",
      createdAt: new Date(),
      ...overrides,
    };
  }

  static makeUpdateDto(
    overrides: Partial<TUpdateNlqQaErrorDto> = {}
  ): TUpdateNlqQaErrorDto {
    return {
      id: "err-1",
      question: "Updated question",
      query: "SELECT * FROM customers",
      knowledgeSourceUsedId: ["k2"],
      errorMessage: "New error message",
      ...overrides,
    };
  }

  static makeOut(
    overrides: Partial<TNlqQaErrorOutRequestDto> = {}
  ): TNlqQaErrorOutRequestDto {
    return {
      id: "err-1",
      question: "How many orders last month?",
      query: "SELECT COUNT(*) FROM orders",
      knowledgeSourceUsedId: ["k1"],
      errorMessage: "Generated SQL query is not safe",
      createdBy: "user-123",
      createdAt: new Date(),
      ...overrides,
    };
  }
}
