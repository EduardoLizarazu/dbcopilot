import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IRemoveNlqQaRefOnNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/remove-nlq-qa-ref-on-nlq-qa-good.step";
import { IDeleteNlqQaHistoryByIdStep } from "@/core/application/steps/nlq-qa/delete-nlq-qa-history-by-id.step";

export interface IDeleteNlqQaHistoryByIdUseCase {
  execute(nlqId: string): Promise<TResponseDto<null>>;
}

export class DeleteNlqQaHistoryByIdUseCase
  implements IDeleteNlqQaHistoryByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly deleteNlqQaHistoryByIdStep: IDeleteNlqQaHistoryByIdStep,
    private readonly removeNlqQaRefOnNlqQaGoodStep: IRemoveNlqQaRefOnNlqQaGoodStep
  ) {}
  async execute(nlqId: string): Promise<TResponseDto<null>> {
    try {
      this.logger.info(
        `[DeleteNlqQaByIdUseCase] Starting deletion process for NLQ QA ID: ${nlqId}`
      );
      //   1. Validate input
      if (!nlqId) {
        return {
          success: false,
          message: "NLQ ID is required to delete history.",
          data: null,
        };
      }

      //   2. Delete NLQ QA history
      await this.deleteNlqQaHistoryByIdStep.run({ nlqId });
      //   3. Remove references in NLQ QA Good
      await this.removeNlqQaRefOnNlqQaGoodStep.run({ nlqId });

      return {
        success: true,
        message: "NLQ QA history deleted successfully.",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteNlqQaByIdUseCase] Error deleting NLQ QA by ID: ${nlqId}`,
        error.message
      );
      return {
        success: false,
        message:
          error.message || `Failed to delete NLQ QA history with ID: ${nlqId}`,
        data: null,
      };
    }
  }
}
