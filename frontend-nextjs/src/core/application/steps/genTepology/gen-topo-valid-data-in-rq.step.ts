import {
  genTopologyInRequestSchema,
  TGenTopologyInRequestDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IGenTopologyValidDataInRqStep {
  run(data: TGenTopologyInRequestDto): Promise<TGenTopologyInRequestDto>;
}

export class GenTopologyValidDataInRqStep
  implements IGenTopologyValidDataInRqStep
{
  constructor(private readonly logger: ILogger) {}

  async run(data: TGenTopologyInRequestDto): Promise<TGenTopologyInRequestDto> {
    try {
      this.logger.info(
        `[GenTopologyValidDataInRqStep] Validating input data for topology generation`,
        data
      );
      // 1. Validate input data
      const validData = await genTopologyInRequestSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[GenTopologyValidDataInRqStep] Invalid input data: ${JSON.stringify(
            validData.error.issues
          )}`
        );
        throw new Error("Invalid input data");
      }
      this.logger.info(
        "[GenTopologyValidDataInRqStep] Input data validated successfully",
        validData.data
      );
      return validData.data;
    } catch (error) {
      this.logger.error(
        `[GenTopologyValidDataInRqStep] Error: ${error.message}`
      );
      throw new Error(
        "Error validating input data for topology generation: " + error.message
      );
    }
  }
}
