import { TVbdInRequestDto, vbdInRequestSchema } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IVbdSplitterValidInputRqUpdateStep {
  run(data: TVbdInRequestDto): Promise<TVbdInRequestDto>;
}

export class VbdSplitterValidInputRqUpdateStep
  implements IVbdSplitterValidInputRqUpdateStep
{
  constructor(private readonly logger: ILogger) {}
  async run(data: TVbdInRequestDto): Promise<TVbdInRequestDto> {
    try {
      this.logger.info(
        `[VbdSplitterValidInputRqUpdateStep] Validating input data for update: ${JSON.stringify(
          data
        )}`
      );

      const validData = await vbdInRequestSchema.safeParseAsync(data);

      if (!validData.success) {
        this.logger.error(
          `[VbdSplitterValidInputRqUpdateStep] Invalid input data: ${JSON.stringify(
            validData.error
          )}`
        );
        throw new Error("Invalid input data: " + validData.error.message);
      }

      return data;
    } catch (error) {
      this.logger.error(
        `[VbdSplitterValidInputRqUpdateStep] Error validating input data: ${error.message}`
      );
      throw new Error("Error validating input data: " + error.message);
    }
  }
}
