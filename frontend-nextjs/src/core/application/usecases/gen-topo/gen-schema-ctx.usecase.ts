import { TSchemaCtxSimpleSchemaDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IGenSchemaCtxStep } from "../../steps/genTepology/gen-schema-ctx.step";

export interface IGenSchemaCtxUseCase {
  execute(
    data: TSchemaCtxSimpleSchemaDto
  ): Promise<TResponseDto<TSchemaCtxSimpleSchemaDto>>;
}

export class GenSchemaCtxUseCase implements IGenSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly genSchemaCtxStep: IGenSchemaCtxStep
  ) {}

  async execute(
    data: TSchemaCtxSimpleSchemaDto
  ): Promise<TResponseDto<TSchemaCtxSimpleSchemaDto>> {
    try {
      this.logger.info(
        "[GenSchemaCtxUseCase] Executing use case with data:",
        data
      );
      const result = await this.genSchemaCtxStep.run(data);

      this.logger.info(
        "[GenSchemaCtxUseCase] Use case executed successfully with result:",
        result
      );
      return {
        success: true,
        message: "Schema context generated successfully",
        data: result,
      };
    } catch (error) {
      this.logger.error(
        "[GenSchemaCtxUseCase] Error executing use case:",
        error.message
      );
      return {
        success: false,
        message: error.message || "Failed to generate schema context",
        data: null,
      };
    }
  }
}
