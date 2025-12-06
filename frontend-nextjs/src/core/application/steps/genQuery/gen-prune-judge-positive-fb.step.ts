import {
  SGenJudgePositiveFbDto,
  SGenJudgePositiveVbOutDto,
  TGenJudgePositiveFbDto,
  TGenJudgePositiveVbOutDto,
} from "../../dtos/gen-query.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IGenCurateJudgePositiveFbStep {
  run(data: TGenJudgePositiveFbDto): Promise<TGenJudgePositiveVbOutDto>;
}

export class GenCurateJudgePositiveFbStep
  implements IGenCurateJudgePositiveFbStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenerationPort: INlqQaQueryGenerationPort
  ) {}
  async run(data: TGenJudgePositiveFbDto): Promise<TGenJudgePositiveVbOutDto> {
    try {
      // Valid data
      const vData = await SGenJudgePositiveFbDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[GenCurateJudgePositiveFbStep] Validation failed",
          vData.error.errors
        );
        throw new Error("Validation failed for judge positive feedback data.");
      }

      const res = await this.nlqQaQueryGenerationPort.genJudgePositiveFb(
        vData.data
      );

      const resValidated = await SGenJudgePositiveVbOutDto.safeParseAsync(res);
      if (!resValidated.success) {
        this.logger.error(
          "[GenCurateJudgePositiveFbStep] Output Validation failed",
          resValidated.error.errors
        );
        throw new Error(
          "Validation failed for judge positive feedback output."
        );
      }

      return resValidated.data;
    } catch (error) {
      this.logger.error(
        "[GenCurateJudgePositiveFbStep] Error in run method",
        error.message
      );
      throw new Error("Failed to judge positive feedback.");
    }
  }
}
