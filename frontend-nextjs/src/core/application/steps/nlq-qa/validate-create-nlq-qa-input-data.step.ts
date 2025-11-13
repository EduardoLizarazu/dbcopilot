import {
  nlqQaInRequestSchema,
  TNlqQaInRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export interface IValidateInputOnCreateNlqQaStep {
  run(data: TNlqQaInRequestDto): Promise<TNlqQaInRequestDto>;
}

export class ValidateInputOnCreateNlqQaStep
  implements IValidateInputOnCreateNlqQaStep
{
  constructor(private readonly logger: ILogger) {}

  async run(data: TNlqQaInRequestDto): Promise<TNlqQaInRequestDto> {
    const nlqQaValidationAsync =
      await nlqQaInRequestSchema.safeParseAsync(data);
    if (!nlqQaValidationAsync.success) {
      this.logger.error(
        "[ValidateInputOnCreateNlqQaStep]: Invalid data:",
        nlqQaValidationAsync.error.errors
      );
      throw new Error(
        `Invalid data: ${JSON.stringify(nlqQaValidationAsync.error.issues)}`
      );
    }
    return nlqQaValidationAsync.data;
  }
}
