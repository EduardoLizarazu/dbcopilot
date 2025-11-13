import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadUserRolesByUserIdStep } from "@/core/application/steps/auth/read-user-role-by-user-id.step";
import { IReadAllWithUserFeedbackErrorStep } from "@/core/application/steps/nlq-qa/read-all-with-user-feedback-error.step";

export interface IReadNlqQaHistoryUseCase {
  execute(data: {
    userId: string;
  }): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto[]>>;
}

export class ReadNlqQaHistoryUseCase implements IReadNlqQaHistoryUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllNlqQaStep: IReadAllWithUserFeedbackErrorStep,
    private readonly readUserRolesByUserIdStep: IReadUserRolesByUserIdStep
  ) {}
  async execute(data: {
    userId: string;
  }): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto[]>> {
    try {
      this.logger.info(
        `[ReadNlqQaHistoryUseCase] Executing NLQ QA history read for userId: ${data.userId}`
      );
      //   1. Validate data
      if (!data || !data?.userId || data.userId.trim().length === 0) {
        this.logger.info(
          `[ReadNlqQaHistoryUseCase] No valid userId provided, reading all NLQ QA history`
        );
      }

      // 2. Read user roles
      const userRoles = await this.readUserRolesByUserIdStep.run(data.userId);
      this.logger.info(
        `[ReadNlqQaHistoryUseCase] User roles for userId ${data.userId}: ${userRoles.roleNames.join(
          ", "
        )}`
      );
      // 3. Determine which step to use based on roles
      const nlqs = await this.readAllNlqQaStep.run();

      if (userRoles.roleNames.includes("admin")) {
        this.logger.info(
          `[ReadNlqQaHistoryUseCase] User is admin, reading all NLQ QA history`
        );
        return {
          success: true,
          message: "NLQ QA history retrieved successfully",
          data: nlqs,
        };
      } else {
        this.logger.info(
          `[ReadNlqQaHistoryUseCase] User is not admin, reading NLQ QA history for userId: ${data.userId}`
        );
        return {
          success: true,
          message: "NLQ QA history retrieved successfully",
          data: nlqs.filter((nlq) => nlq?.createdBy === data.userId),
        };
      }
    } catch (error) {
      this.logger.error(
        "Error in ReadNlqQaHistoryUseCase:",
        (error as any)?.message
      );
      return {
        success: false,
        message: (error as any)?.message || "Failed to read NLQ QA history.",
        data: [],
      };
    }
  }
}
