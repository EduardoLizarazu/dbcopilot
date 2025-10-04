import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import {
  TNlqQaGoodOutRequestDto,
  TNlqQaGoodOutWithUserRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IReadNlqQaGoodByIdUseCase } from "./read-nlq-qa-good-by-id.usecase";

export interface IReadAllNlqQaGoodUseCase {
  execute(): Promise<TResponseDto<TNlqQaGoodOutWithUserRequestDto[]>>;
}

export class ReadAllNlqQaGoodUseCase implements IReadAllNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(): Promise<TResponseDto<TNlqQaGoodOutWithUserRequestDto[]>> {
    try {
      // 1. Find all NLQ QA Good
      const results = await this.nlqQaGoodRepository.findAllWithUser();
      this.logger.info(
        `[ReadAllNlqQaGoodUseCase] Found ${results ? results.length : 0} NLQ QA Good entries`
      );

      return {
        success: true,
        data: results,
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
