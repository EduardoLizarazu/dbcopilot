import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import { TNlqQaGoodOutWithUserAndConnRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

export interface IReadAllNlqQaGoodUseCase {
  execute(): Promise<TResponseDto<TNlqQaGoodOutWithUserAndConnRequestDto[]>>;
}

export class ReadAllNlqQaGoodUseCase implements IReadAllNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(): Promise<
    TResponseDto<TNlqQaGoodOutWithUserAndConnRequestDto[]>
  > {
    try {
      // 1. Find all NLQ QA Good
      const results = await this.nlqQaGoodRepository.findAllWithUserAndConn();
      this.logger.info(
        `[ReadAllNlqQaGoodUseCase] Found ${results ? results.length : 0} NLQ QA Good entries`
      );

      return {
        success: true,
        data: results,
        message: "NLQ QA Good retrieved successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      this.logger.error("[ReadAllNlqQaGoodUseCase] Error:", errorMessage);

      return {
        success: false,
        message: `Error retrieving NLQ QA Good: ${errorMessage}`,
        data: null,
      };
    }
  }
}
