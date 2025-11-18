import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IUpdateSchemaCtxStep } from "../../steps/schemaCtx/update-schema-ctx.step";

export interface IUpdateSchemaCtxUseCase {
  execute(data: TSchemaCtxBaseDto): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class UpdateSchemaCtxUseCase implements IUpdateSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly updateSchemaCtxStep: IUpdateSchemaCtxStep
  ) {}
  async execute(
    data: TSchemaCtxBaseDto
  ): Promise<TResponseDto<TSchemaCtxBaseDto>> {
    try {
      this.logger.info(`[UpdateSchemaCtxUseCase] Executing with data:`, data);
      const updatedSchemaCtx = await this.updateSchemaCtxStep.run(data);
      this.logger.info(
        `[UpdateSchemaCtxUseCase] Successfully updated schema context with id: ${updatedSchemaCtx.id}`
      );
      return {
        success: true,
        message: "Schema context updated successfully",
        data: updatedSchemaCtx,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateSchemaCtxUseCase] Error updating schema context: `,
        error.message
      );
      return {
        success: false,
        message: error.message || "Error updating schema context",
        data: null,
      };
    }
  }
}
