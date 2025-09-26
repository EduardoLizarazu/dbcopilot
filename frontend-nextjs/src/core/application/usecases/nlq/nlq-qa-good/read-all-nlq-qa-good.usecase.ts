import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import { TNlqQaGoodOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IReadNlqQaGoodByIdUseCase } from "./read-nlq-qa-good-by-id.usecase";

export interface IReadAllNlqQaGoodUseCase {
  execute(): Promise<TResponseDto<TNlqQaGoodOutRequestDto[]>>;
}

export class ReadAllNlqQaGoodUseCase implements IReadAllNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(): Promise<TResponseDto<TNlqQaGoodOutRequestDto[]>> {
    try {
      // 1. Find all NLQ QA Good
      const result = await this.nlqQaGoodRepository.findAll();
      return {
        success: true,
        data: result,
        message: "NLQ QA Good retrieved successfully",
      };
    } catch (error) {
      this.logger.error("[ReadAllNlqQaGoodUseCase] Error:", error);
      return {
        success: false,
        message: "Error NLQ QA Good",
        data: null,
      };
    }
  }
}
