import {
  TUpdateNlqQaGoodInRqDto,
  updateNlqQaGoodInRqDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IValidateUpdateNlqQaGoodInputDataStep {
  run(data: TUpdateNlqQaGoodInRqDto): Promise<TUpdateNlqQaGoodInRqDto>;
}

export class ValidateUpdateNlqQaGoodInputDataStep
  implements IValidateUpdateNlqQaGoodInputDataStep
{
  constructor(private readonly logger: ILogger) {}
  async run(data: TUpdateNlqQaGoodInRqDto): Promise<TUpdateNlqQaGoodInRqDto> {
    try {
      this.logger.info(
        "[ValidateUpdateNlqQaGoodInputDataStep]: Validating data:",
        JSON.stringify(data)
      );
      //   1. Validate data
      const validData = await updateNlqQaGoodInRqDto.safeParseAsync({
        ...data,
      });

      if (!validData.success) {
        this.logger.error(
          "[ValidateUpdateNlqQaGoodInputDataStep]: Invalid data:",
          validData.error.errors
        );
        throw new Error(
          `Invalid data: ${JSON.stringify(validData.error.message)}`
        );
      }
      return validData.data;
    } catch (error) {
      this.logger.error(
        "Error validating NLQ QA Good update input data",
        JSON.stringify(error)
      );
      throw new Error(
        "Error validating NLQ QA Good update input data: " + error.message
      );
    }
  }
}
