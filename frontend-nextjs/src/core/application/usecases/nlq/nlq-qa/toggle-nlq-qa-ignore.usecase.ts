import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IToggleNlqQaIgnoreStep } from "@/core/application/steps/nlq-qa/toggle-nlq-qa-ignore.step";

export interface IToggleNlqQaIgnoreUseCase {
  execute(data: {
    nlqQaId: string;
    isIgnore: boolean;
  }): Promise<TResponseDto<null>>;
}

export class ToggleNlqQaIgnoreUseCase implements IToggleNlqQaIgnoreUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly toggleIgnoreStep: IToggleNlqQaIgnoreStep
  ) {}

  async execute(data: {
    nlqQaId: string;
    isIgnore: boolean;
  }): Promise<TResponseDto<null>> {
    try {
      this.logger.info("[ToggleNlqQaIgnoreUseCase] Executing with data", data);

      if (!data?.nlqQaId || typeof data?.isIgnore !== "boolean") {
        return {
          success: false,
          message: "Invalid input data.",
          data: null,
        };
      }

      await this.toggleIgnoreStep.run({
        nlqQaId: data.nlqQaId,
        isIgnore: data.isIgnore,
      });
      return {
        success: true,
        message: "NLQ QA ignore status toggled successfully.",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        "[ToggleNlqQaIgnoreUseCase] Error toggling NLQ QA ignore",
        { error, data }
      );

      return {
        success: false,
        message:
          error.message || "An error occurred while toggling NLQ QA ignore.",
        data: null,
      };
    }
  }
}
