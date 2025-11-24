import { TSchemaCtxBaseDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadSchemaCtxByConnIdStep } from "../../steps/schemaCtx/read-schema-ctx-by-conn-id.step";

export interface IReadSchemaCtxByConnIdUseCase {
  execute(data: { connId: string }): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class ReadSchemaCtxByConnIdUseCase
  implements IReadSchemaCtxByConnIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readSchemaCtxByConnId: IReadSchemaCtxByConnIdStep
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

      // Get schema context by connection ID
      const schemaCtxResult = await this.readSchemaCtxByConnId.run({
        connId: data.connId,
      });
      if (schemaCtxResult) {
        this.logger.info(
          `ReadSchemaCtxByConnIdUseCase - execute - Found schema context for connId: ${data.connId}`
        );
        return {
          success: true,
          message: "Schema context found for the given connection ID",
          data: schemaCtxResult,
        };
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
