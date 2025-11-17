import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IDeleteSchemaCtxStep } from "../../steps/schemaCtx/delete-schema-ctx.step";

export interface IDeleteSchemaCtxUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteSchemaCtxUseCase implements IDeleteSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteSchemaCtxStep: IDeleteSchemaCtxStep
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      this.logger.info(
        `[DeleteSchemaCtxUseCase] Executing delete schema context use case for id ${id}`
      );

      await this.deleteSchemaCtxStep.execute(id);

      return {
        success: true,
        data: null,
        message: `Schema context with id ${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteSchemaCtxUseCase] Error executing delete schema context use case for id ${id}: `,
        error.message
      );
      return {
        success: false,
        data: null,
        message: error.message || "Error deleting schema context",
      };
    }
  }
}
