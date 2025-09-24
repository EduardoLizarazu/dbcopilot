import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";

export interface IReadNlqQaErrorByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaErrorOutRequestDto>>;
}

export class ReadNlqQaErrorByIdUseCase implements IReadNlqQaErrorByIdUseCase {
  constructor(
    private readonly nlqQaErrorRepository: INlqQaErrorRepository,
    private readonly loggerProvider: ILogger
  ) {}
  async execute(id: string): Promise<TResponseDto<TNlqQaErrorOutRequestDto>> {
    try {
      // 1. Validate input
      if (!id) {
        this.loggerProvider.error(
          `[ReadNlqQaErrorByIdUseCase] Invalid id: ${id}`
        );
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }

      this.loggerProvider.info(
        `[ReadNlqQaErrorByIdUseCase] - Executing read NLQ QA Error by ID: ${id}`
      );

      // 2. Fetch NLQ QA Error by ID
      const nlqQaError = await this.nlqQaErrorRepository.findById(id);
      if (!nlqQaError) {
        this.loggerProvider.warn(
          `[ReadNlqQaErrorByIdUseCase] - NLQ QA Error not found for ID: ${id}`
        );
        return {
          message: "NLQ QA Error not found",
          data: null,
          success: false,
        };
      }
      // 3. Return success response
      return {
        message: "NLQ QA Error retrieved successfully",
        data: nlqQaError ? nlqQaError : null,
        success: true,
      };
    } catch (error) {
      this.loggerProvider.error(
        `[ReadNlqQaErrorByIdUseCase] - Error executing read NLQ QA Error by ID: ${id} - ${error}`
      );
      return {
        message: "Internal server error",
        data: null,
        success: false,
      };
    }
  }
}
