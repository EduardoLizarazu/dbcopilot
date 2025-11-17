import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadByIdSchemaCtxStep } from "../../steps/schemaCtx/read-by-id-schema-ctx.step";

export interface IReadByIdSchemaCtxUseCase {
  execute(id: string): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class ReadByIdSchemaCtxUseCase implements IReadByIdSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readByIdSchemaCtxStep: IReadByIdSchemaCtxStep
  ) {}
  async execute(id: string): Promise<TResponseDto<TSchemaCtxBaseDto>> {
    try {
      this.logger.info(
        "[ReadByIdSchemaCtxUseCase] Executing use case to read schema context by id",
        id
      );
      const schemaCtx = await this.readByIdSchemaCtxStep.run(id);
      this.logger.info(
        "[ReadByIdSchemaCtxUseCase] Successfully retrieved schema context",
        schemaCtx
      );
      return {
        success: true,
        data: schemaCtx,
        message: "Schema context retrieved successfully",
      };
    } catch (error) {
      this.logger.error(
        "[ReadByIdSchemaCtxUseCase] Error executing use case: ",
        error.message
      );

      return {
        success: false,
        data: null,
        message: error.message || "Error retrieving schema context by id",
      };
    }
  }
}
