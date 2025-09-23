import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import { TNlqQaGoodOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

export interface IReadNlqQaGoodByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

export class ReadNlqQaGoodByIdUseCase implements IReadNlqQaGoodByIdUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      const result = await this.nlqQaGoodRepository.findById(id);
      if (!result) {
        this.logger.error(
          `[ReadNlqQaGoodByIdUseCase] NLQ QA Good not found for ID: ${id}`
        );
        return {
          success: false,
          message: "NLQ QA Good not found",
          data: null,
        };
      }
      return {
        success: true,
        data: result,
        message: "NLQ QA Good retrieved successfully",
      };
    } catch (error) {
      this.logger.error(
        "[ReadNlqQaGoodByIdUseCase] Error retrieving NLQ QA Good",
        error
      );
      return {
        success: false,
        message: "Error retrieving NLQ QA Good",
        data: null,
      };
    }
  }
}
