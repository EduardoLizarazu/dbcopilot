import {
  TDbConnectionOutRequestDto,
  TUpdateDbConnInReqDto,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IUpdateDbConnStep } from "../../steps/dbconn/update-dbconn.step";
import { IValidateInputUpdateDbConnStep } from "../../steps/dbconn/validate-input-update-dbconn.step";

export interface IUpdateDbConnectionUseCase {
  execute(
    id: string,
    data: TUpdateDbConnInReqDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>>;
}

/**
 * Update db connection use case:
 * 1. Validate input data
 * 2. Update the db connection
 * 3. Return response
 */

export class UpdateDbConnectionUseCase implements IUpdateDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validateUpdateInputDbConnStep: IValidateInputUpdateDbConnStep,
    private readonly updateDbConnStep: IUpdateDbConnStep
  ) {}

  async execute(
    id: string,
    data: TUpdateDbConnInReqDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateDbConnectionUseCase] Updating DB connection with id: ${id} and data:`,
        data
      );
      // 1. Validate input data
      const vData = await this.validateUpdateInputDbConnStep.run(data);

      // 2. Update the db connection
      const updateDto = {
        ...vData,
        id,
        updatedBy: vData.actorId,
      };
      delete updateDto.actorId;

      const updatedDbConn = await this.updateDbConnStep.run(updateDto);

      // 3. Return response
      return {
        success: true,
        message: "DB connection updated successfully",
        data: updatedDbConn,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateDbConnectionUseCase] Error updating DB connection: ${error.message}`
      );
      return {
        data: null,
        message: error.message || "Error updating DB connection",
        success: false,
      };
    }
  }
}
