import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import { TNlqQaGoodOutWithUserRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

export interface IReadNlqQaGoodByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaGoodOutWithUserRequestDto>>;
}

export class ReadNlqQaGoodByIdUseCase implements IReadNlqQaGoodByIdUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(
    id: string
  ): Promise<TResponseDto<TNlqQaGoodOutWithUserRequestDto>> {
    try {
      // 1. Validate
      if (!id) {
        this.logger.error("[ReadNlqQaGoodByIdUseCase] ID is required");
        return {
          success: false,
          message: "ID is required",
          data: null,
        };
      }

      // 2. Find NLQ QA Good by ID
      const result = await this.nlqQaGoodRepository.findWithUserById(id);
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

      // 3. Return success response
      return {
        success: true,
        data: result,
        message: "NLQ QA Good retrieved successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      this.logger.error(
        "[ReadNlqQaGoodByIdUseCase] Error retrieving NLQ QA Good:",
        errorMessage
      );

      return {
        success: false,
        message: `Error retrieving NLQ QA Good: ${errorMessage}`,
        data: null,
      };
    }
  }
}
