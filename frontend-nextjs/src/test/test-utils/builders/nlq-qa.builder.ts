// test-utils/builders/nlqQa.builder.ts
import {
  TCreateNlqQaDto,
  TUpdateNlqQaDto,
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";

export class NlqQaBuilder {
  static makeInRequest(
    overrides: Partial<TNlqQaInRequestDto> = {}
  ): TNlqQaInRequestDto {
    return {
      question: "How many orders last month?",
      createdBy: "user-123",
      ...overrides,
    };
  }

  static makeCreateDto(
    overrides: Partial<TCreateNlqQaDto> = {}
  ): TCreateNlqQaDto {
    return {
      question: "How many orders last month?",
      query:
        "SELECT COUNT(*) FROM orders WHERE created_at >= DATEADD(month, -1, GETDATE())",
      isGood: true,
      timeQuestion: new Date(),
      timeQuery: new Date(),
      knowledgeSourceUsedId: ["k1"],
      userDeleted: false,
      feedbackId: "fb-123",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeUpdateDto(
    overrides: Partial<TUpdateNlqQaDto> = {}
  ): TUpdateNlqQaDto {
    return {
      id: "nlq-1",
      question: "Updated question",
      query: "SELECT * FROM customers",
      isGood: false,
      timeQuestion: new Date(),
      timeQuery: new Date(),
      knowledgeSourceUsedId: ["k2"],
      userDeleted: false,
      feedbackId: "fb-999",
      updatedBy: "user-999",
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeOut(
    overrides: Partial<TNlqQaOutRequestDto> = {}
  ): TNlqQaOutRequestDto {
    return {
      id: "nlq-1",
      question: "How many orders last month?",
      query:
        "SELECT COUNT(*) FROM orders WHERE created_at >= DATEADD(month, -1, GETDATE())",
      isGood: true,
      timeQuestion: new Date(),
      timeQuery: new Date(),
      knowledgeSourceUsedId: ["k1"],
      userDeleted: false,
      feedbackId: "fb-123",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
