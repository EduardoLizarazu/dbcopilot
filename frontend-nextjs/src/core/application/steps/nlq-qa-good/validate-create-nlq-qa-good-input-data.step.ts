import {
  nlqQaGoodInRequestSchema,
  TNlqQaGoodInRequestDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IValidateCreateNlqQaGoodInputDataStep {
  run(data: TNlqQaGoodInRequestDto): Promise<TNlqQaGoodInRequestDto>;
}

export class ValidateCreateNlqQaGoodInputDataStep {
  constructor(private readonly logger: ILogger) {}

  async run(data: TNlqQaGoodInRequestDto): Promise<TNlqQaGoodInRequestDto> {
    try {
      const nlqQaGoodValidationAsync =
        await nlqQaGoodInRequestSchema.safeParseAsync(data);

      if (!nlqQaGoodValidationAsync.success) {
        this.logger.error(
          "[ValidateCreateNlqQaGoodInputDataStep]: Invalid data:",
          nlqQaGoodValidationAsync.error.errors
        );
        throw new Error(
          `Invalid data: ${JSON.stringify(nlqQaGoodValidationAsync.error.issues)}`
        );
      }

      return nlqQaGoodValidationAsync.data;
    } catch (error) {
      this.logger.error(
        "Error validating NLQ QA Good input data",
        JSON.stringify(error)
      );
      throw new Error(
        "Error validating NLQ QA Good input data: " + error.message
      );
    }
  }
}
