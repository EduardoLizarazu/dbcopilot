import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadAllSchemaCtxStep } from "../../steps/schemaCtx/read-all-schema-ctx.step";

export interface IReadSchemaCtxByConnIdUseCase {
  execute(data: { connId: string }): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class ReadSchemaCtxByConnIdUseCase
  implements IReadSchemaCtxByConnIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readAllSchemaCtx: IReadAllSchemaCtxStep
  ) {}
  async execute(data: {
    connId: string;
  }): Promise<TResponseDto<TSchemaCtxBaseDto>> {
    try {
      this.logger.info(
        `ReadSchemaCtxByConnIdUseCase - execute - Start for connId: ${data.connId}`
      );
      if (!data?.connId) {
        return {
          success: false,
          message: "Connection ID is required",
          data: null,
        };
      }

      // Get all schema contexts
      const allSchemaCtxResult = await this.readAllSchemaCtx.run();

      // On iterate over and schema contexts, and iterate over their dbConnectionIds to find a match with data.connId
      for (const schemaCtx of allSchemaCtxResult) {
        if (schemaCtx.dbConnectionIds.includes(data.connId)) {
          this.logger.info(
            `ReadSchemaCtxByConnIdUseCase - execute - Found schema context for connId: ${data.connId}`
          );
          return {
            success: true,
            message: "Schema context found for the given connection ID",
            data: schemaCtx,
          };
        }
      }

      this.logger.info(
        `ReadSchemaCtxByConnIdUseCase - execute - No schema context found for connId: ${data.connId}`
      );
      return {
        success: true,
        message: "No schema context found for the given connection ID",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `ReadSchemaCtxByConnIdUseCase - execute - Error reading schema context for connection ID ${data.connId}:`,
        error.message || error || "Unknown error"
      );
      return {
        success: false,
        message:
          error.message || "Failed to read schema context by connection ID",
        data: null,
      };
    }
  }
}
