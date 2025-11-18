import {
  TCreateSchemaCtxBaseDto,
  TCreateSchemaCtxBaseInReqDto,
  TSchemaCtxBaseDto,
} from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ICreateSchemaCtxStep } from "../../steps/schemaCtx/create-schema-ctx.step";
import { IFormatSchemaCtxStep } from "../../steps/schemaCtx/format-schema-ctx.step";

/**
 * Create schema context use case:
 * 1. Format and validate input data
 * 2. Create schema context
 * 3. Fetch and return created schema context
 */

export interface ICreateSchemaCtxUseCase {
  execute(
    data: TCreateSchemaCtxBaseDto
  ): Promise<TResponseDto<TSchemaCtxBaseDto>>;
}

export class CreateSchemaCtxUseCase implements ICreateSchemaCtxUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly createSchemaCtxStep: ICreateSchemaCtxStep
  ) {}
  async execute(
    data: TCreateSchemaCtxBaseDto
  ): Promise<TResponseDto<TSchemaCtxBaseDto>> {
    try {
      this.logger.info(
        `[CreateSchemaCtxUseCase] Executing create schema context use case with data: ${JSON.stringify(data)}`
      );

      // 2. Create schema context
      const createdSchemaCtx = await this.createSchemaCtxStep.run(data);
      this.logger.info(
        `[CreateSchemaCtxUseCase] Successfully created schema context with id: ${createdSchemaCtx.id}`
      );

      // 3. Return response
      return {
        success: true,
        message: "Schema context created successfully",
        data: createdSchemaCtx,
      };
    } catch (error) {
      this.logger.error(
        `[CreateSchemaCtxUseCase] Error creating schema context: `,
        error.message
      );
      return {
        success: false,
        message: error.message || "Error creating schema context",
        data: null,
      };
    }
  }
}
