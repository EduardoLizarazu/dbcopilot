import {
  nlqQaInRequestSchema,
  TNlqQaInRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export interface ICreateNlqQaValidInputDataStep {
  run(data: TNlqQaInRequestDto): Promise<TNlqQaInRequestDto>;
}

export class CreateNlqQaValidInputDataStep
  implements ICreateNlqQaValidInputDataStep
{
  constructor(private readonly logger: ILogger) {}

  async run(data: TNlqQaInRequestDto): Promise<TNlqQaInRequestDto> {
    const nlqQaValidationAsync =
      await nlqQaInRequestSchema.safeParseAsync(data);
    if (!nlqQaValidationAsync.success) {
      this.logger.error(
        "[CreateNlqQaValidInputDataStep]: Invalid data:",
        nlqQaValidationAsync.error.errors
      );
      throw new Error(
        `Invalid data: ${JSON.stringify(nlqQaValidationAsync.error.issues)}`
      );
    }
    return nlqQaValidationAsync.data;
  }
}
