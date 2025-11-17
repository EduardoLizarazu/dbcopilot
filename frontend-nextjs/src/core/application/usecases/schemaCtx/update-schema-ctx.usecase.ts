import {
  TSchemaCtxBaseDto,
  TUpdateSchemaCtxBaseInReqDto,
} from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IFormatSchemaCtxStep } from "../../steps/schemaCtx/format-schema-ctx.step";

export interface IUpdateSchemaCtxUseCase {
  execute(
    data: TUpdateSchemaCtxBaseInReqDto
  ): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class UpdateSchemaCtxUseCase implements IUpdateSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly formatSchemaCtxStep: IFormatSchemaCtxStep,
    private readonly updateSchemaCtxStep: undefined
  ) {}
  execute(
    data: TUpdateSchemaCtxBaseInReqDto
  ): Promise<TResponseDto<TSchemaCtxBaseDto>> {
    try {
      throw new Error("Method not implemented.");
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
