import { TNlqQaHistoryOutDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadUserRolesByUserIdStep } from "@/core/application/steps/auth/read-user-role-by-user-id.step";
import { IReadAllNlqQaByUserIdStep } from "@/core/application/steps/nlq-qa/read-all-nlq-qa-base-on-user.step";
import { IReadAllNlqQaStep } from "@/core/application/steps/nlq-qa/read-all-nlq-qa.step";

export interface IReadNlqQaHistoryUseCase {
  execute(data: {
    userId: string;
  }): Promise<TResponseDto<TNlqQaHistoryOutDto[]>>;
}

export class ReadNlqQaHistoryUseCase implements IReadNlqQaHistoryUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllNlqQaByUserIdStep: IReadAllNlqQaByUserIdStep,
    private readonly readAllNlqQaStep: IReadAllNlqQaStep,
    private readonly readUserRolesByUserIdStep: IReadUserRolesByUserIdStep
  ) {}
  async execute(data: {
    userId: string;
  }): Promise<TResponseDto<TNlqQaHistoryOutDto[]>> {
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

      if (userRoles.roleNames.includes("admin")) {
        this.logger.info(
          `[ReadNlqQaHistoryUseCase] User is admin, reading all NLQ QA history`
        );
        return {
          success: true,
          message: "NLQ QA history retrieved successfully",
          data: await this.readAllNlqQaStep.run(),
        };
      } else {
        this.logger.info(
          `[ReadNlqQaHistoryUseCase] User is not admin, reading NLQ QA history for userId: ${data.userId}`
        );
        return {
          success: true,
          message: "NLQ QA history retrieved successfully",
          data: await this.readAllNlqQaByUserIdStep.run({
            userId: data.userId,
          }),
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
