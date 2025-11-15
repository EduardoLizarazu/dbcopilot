import {
  TUpdateDbConnInReqDto,
  updateDbConnInRqSchema,
} from "../../dtos/dbconnection.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

/**
 * Validate input data for updating db connection step:
 * 1. Validates the input data for updating a db connection.
 * 2. Returns the validated data or throws an error if validation fails.
 */

export interface IValidateInputUpdateDbConnStep {
  run(data: TUpdateDbConnInReqDto): Promise<TUpdateDbConnInReqDto>;
}

export class ValidateInputUpdateDbConnStep
  implements IValidateInputUpdateDbConnStep
{
  constructor(private readonly logger: ILogger) {}
  async run(data: TUpdateDbConnInReqDto): Promise<TUpdateDbConnInReqDto> {
    try {
      this.logger.info(
        "[ValidateInputUpdateDbConnStep] Validating input data for updating DB connection",
        data
      );
      const vData = await updateDbConnInRqSchema.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[ValidateInputUpdateDbConnStep] Validation failed:",
          JSON.stringify(vData.error.errors)
        );
        throw new Error(vData.error.errors.map((e) => e.message).join(", "));
      }
      return vData.data;
    } catch (error) {
      this.logger.error(
        "[ValidateInputUpdateDbConnStep] Error:",
        error.message
      );
      throw new Error(
        error.message ||
          "Error validating input data for updating DB connection"
      );
    }
  }
}
