import {
  createDbConnInRqSchema,
  TCreateDbConnInReqDto,
} from "../../dtos/dbconnection.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

/**
 * Step to validate input data for creating a DB Connection:
 * 1. Validates the input data against the defined schema.
 * 2. Return the validated data or throws an error if validation fails.
 */

export interface IValidateInputCreateDbConnStep {
  run(data: TCreateDbConnInReqDto): Promise<TCreateDbConnInReqDto>;
}

export class ValidateInputCreateDbConnStep
  implements IValidateInputCreateDbConnStep
{
  constructor(private readonly logger: ILogger) {}

  async run(data: TCreateDbConnInReqDto): Promise<TCreateDbConnInReqDto> {
    try {
      this.logger.info(
        "[ValidateInputCreateDbConnStep] Validating input data for creating DB Connection:",
        data
      );
      // 1. Validate input data
      const vData = await createDbConnInRqSchema.safeParseAsync(data);

      if (!vData.success) {
        this.logger.error(
          `[ValidateInputCreateDbConnStep] Invalid input data: ${JSON.stringify(
            vData.error.errors
          )}`
        );
        throw new Error(vData.error.errors.map((e) => e.message).join(", "));
      }

      this.logger.info(
        "[ValidateInputCreateDbConnStep] Input data validated successfully:",
        vData.data
      );
      return vData.data;
    } catch (error) {
      this.logger.error(
        "[ValidateInputCreateDbConnStep] Error:",
        error.message
      );
      throw new Error(error.message);
    }
  }
}
