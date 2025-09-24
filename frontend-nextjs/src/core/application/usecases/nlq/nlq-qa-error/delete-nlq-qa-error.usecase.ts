import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";

export interface IDeleteNlqQaErrorUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteNlqQaErrorUseCase implements IDeleteNlqQaErrorUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaErrorRepository: INlqQaErrorRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(
          `[DeleteNlqQaErrorUseCase] Invalid ID provided: ${id}`
        );
        return {
          success: false,
          message: "Invalid ID provided",
          data: null,
        };
      }

      // 2. Check if the NLQ QA Error exists
      const errorExists = await this.nlqQaErrorRepository.findById(id);
      if (!errorExists) {
        this.logger.warn(
          `[DeleteNlqQaErrorUseCase] NLQ QA Error not found: ${id}`
        );
        return {
          success: false,
          message: "NLQ QA Error not found",
          data: null,
        };
      }

      // 3. Delete the NLQ QA Error
      await this.nlqQaErrorRepository.delete(id);
      this.logger.info(`[DeleteNlqQaErrorUseCase] Deleted Nlq Qa Error: ${id}`);

      // 4. Return success response
      return {
        success: true,
        message: "NLQ QA Error deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteNlqQaErrorUseCase] Error deleting Nlq Qa Error: ${error}`
      );
      throw error;
    }
  }
}
