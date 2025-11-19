import {
  schemaCtxSimpleSchemaDto,
  TSchemaCtxSimpleSchemaDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenSchemaCtxStep {
  run(data: TSchemaCtxSimpleSchemaDto): Promise<TSchemaCtxSimpleSchemaDto>;
}

export class GenSchemaCtxStep implements IGenSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(
    data: TSchemaCtxSimpleSchemaDto
  ): Promise<TSchemaCtxSimpleSchemaDto> {
    try {
      this.logger.info("[GenSchemaCtxStep] Generating schema context...", data);

      const vData = await schemaCtxSimpleSchemaDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[GenSchemaCtxStep] Invalid input data:",
          vData.error
        );
        throw new Error("Invalid input data");
      }
      const result = await this.genTopoPort.genSchemaCtx(data);

      const vResult = await schemaCtxSimpleSchemaDto.safeParseAsync(result);
      if (!vResult.success) {
        this.logger.error(
          "[GenSchemaCtxStep] Invalid output data:",
          vResult.error
        );
        throw new Error("Invalid output data");
      }

      this.logger.info("[GenSchemaCtxStep] Generated schema context:", result);
      return result;
    } catch (error) {
      this.logger.error(
        "[GenSchemaCtxStep] Error generating schema context:",
        error.message
      );
      throw new Error(error.message || "Failed to generate schema context");
    }
  }
}
