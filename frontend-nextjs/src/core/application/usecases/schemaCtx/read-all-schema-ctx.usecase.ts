import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadAllSchemaCtxStep } from "../../steps/schemaCtx/read-all-schema-ctx.step";

export interface IReadAllSchemaCtxUseCase {
  execute(): Promise<TResponseDto<TSchemaCtxBaseDto[]>>;
}

export class ReadAllSchemaCtxUseCase implements IReadAllSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllSchemaCtxStep: IReadAllSchemaCtxStep
  ) {}
  async execute(): Promise<TResponseDto<TSchemaCtxBaseDto[]>> {
    try {
      this.logger.info(
        "[ReadAllSchemaCtxUseCase] Executing use case to read all schema contexts"
      );
      const schemaCtxs = await this.readAllSchemaCtxStep.run();
      this.logger.info(
        "[ReadAllSchemaCtxUseCase] Successfully retrieved schema contexts",
        schemaCtxs
      );
      return {
        success: true,
        data: schemaCtxs,
        message: "Schema contexts retrieved successfully",
      };
    } catch (error) {
      this.logger.error(
        "[ReadAllSchemaCtxUseCase] Error executing use case: ",
        error.message
      );
      return {
        success: false,
        data: null,
        message: error.message || "Error retrieving schema contexts",
      };
    }
  }
}
