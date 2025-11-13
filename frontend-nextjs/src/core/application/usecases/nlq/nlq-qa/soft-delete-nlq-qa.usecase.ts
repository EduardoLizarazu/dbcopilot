import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IDeleteNlqQaUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class SoftDeleteNlqQaUseCase implements IDeleteNlqQaUseCase {
  constructor(
    private readonly nlqQaRepository: INlqQaRepository,
    private readonly logger: ILogger
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(`[SoftDeleteNlqQaAppUseCase] Invalid id: ${id}`);
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }
      // 2. Check if NLQ QA entry exists
      const existingNlqQa = await this.nlqQaRepository.findById(id);
      if (!existingNlqQa) {
        this.logger.error(
          `[SoftDeleteNlqQaAppUseCase] NLQ QA entry not found: ${id}`
        );
        return {
          success: false,
          message: "NLQ QA entry not found",
          data: null,
        };
      }
      // 3. Soft delete NLQ QA entry
      await this.nlqQaRepository.softDeleteById(id);

      // 4. Return success response
      return {
        success: true,
        message: "NLQ QA entry soft deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Error in SoftDeleteNlqQaAppUseCase: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
