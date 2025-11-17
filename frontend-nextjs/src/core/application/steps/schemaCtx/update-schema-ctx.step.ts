import {
  schemaCtxBase,
  TSchemaCtxBaseDto,
  TUpdateSchemaCtxBaseInReqDto,
  updateSchemaCtxBaseInReq,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface IUpdateSchemaCtxStep {
  run(data: TSchemaCtxBaseDto): Promise<TSchemaCtxBaseDto>;
}

export class UpdateSchemaCtxStep implements IUpdateSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepo: ISchemaCtxRepository
  ) {}

  async run(data: TSchemaCtxBaseDto): Promise<TSchemaCtxBaseDto> {
    try {
      this.logger.info(
        `[UpdateSchemaCtxStep] Updating schema context with data: ${JSON.stringify(data)}`
      );
      const vData = await schemaCtxBase.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[UpdateSchemaCtxStep] Validation failed: ${JSON.stringify(vData.error.format())}`
        );
        throw new Error(
          vData.error.errors.map((e) => e.message).join(", ") ||
            "Invalid data provided for updating schema context"
        );
      }

      const prevSchemaCtx = await this.schemaCtxRepo.findById(data.id);
      if (!prevSchemaCtx) {
        this.logger.error(
          `[UpdateSchemaCtxStep] Schema context not found for ID: ${data.id}`
        );
        throw new Error("Schema context not found");
      }

      await this.schemaCtxRepo.update(vData.data.id, vData.data);

      const updatedSchemaCtx = await this.schemaCtxRepo.findById(data.id);
      if (!updatedSchemaCtx) {
        this.logger.error(
          `[UpdateSchemaCtxStep] Schema context not found after update for ID: ${data.id}`
        );
        throw new Error("Schema context not found after update");
      }
      this.logger.info(
        `[UpdateSchemaCtxStep] Successfully updated schema context for ID: ${data.id}`
      );
      return updatedSchemaCtx;
    } catch (error) {
      this.logger.error(
        `[UpdateSchemaCtxStep] Error updating schema context: `,
        error.message
      );
      throw new Error(error.message || "Error updating schema context");
    }
  }
}
