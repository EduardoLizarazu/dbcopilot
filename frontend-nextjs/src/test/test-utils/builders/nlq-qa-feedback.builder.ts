// test-utils/builders/nlqQaFeedback.builder.ts
import {
  TCreateNlqQaFeedbackDto,
  TUpdateNlqQaFeedbackDto,
  TNlqQaFeedbackInRequestDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";

export class NlqQaFeedbackBuilder {
  static makeInRequest(
    overrides: Partial<TNlqQaFeedbackInRequestDto> = {}
  ): TNlqQaFeedbackInRequestDto {
    return {
      id: "fb-1",
      nlqQaId: "nlq-1",
      isGood: true,
      comment: "Very useful answer",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeCreateDto(
    overrides: Partial<TCreateNlqQaFeedbackDto> = {}
  ): TCreateNlqQaFeedbackDto {
    return {
      nlqQaId: "nlq-1",
      isGood: true,
      comment: "Very useful answer",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeUpdateDto(
    overrides: Partial<TUpdateNlqQaFeedbackDto> = {}
  ): TUpdateNlqQaFeedbackDto {
    return {
      id: "fb-1",
      nlqQaId: "nlq-1",
      isGood: false,
      comment: "I changed my mind",
      updatedBy: "user-999",
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeOut(
    overrides: Partial<TNlqQaFeedbackOutRequestDto> = {}
  ): TNlqQaFeedbackOutRequestDto {
    return {
      id: "fb-1",
      nlqQaId: "nlq-1",
      isGood: true,
      comment: "Very useful answer",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
