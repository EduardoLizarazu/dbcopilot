import {
  createSchemaCtxBase,
  TCreateSchemaCtxBaseDto,
  TSchemaCtxBaseDto,
} from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "../../interfaces/schemaCtx.inter";

export interface ICreateSchemaCtxStep {
  run(data: TCreateSchemaCtxBaseDto): Promise<TSchemaCtxBaseDto>;
}

export class CreateSchemaCtxStep implements ICreateSchemaCtxStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaCtxRepo: ISchemaCtxRepository
  ) {}
  async run(data: TCreateSchemaCtxBaseDto): Promise<TSchemaCtxBaseDto> {
    try {
      this.logger.info(
        `[CreateSchemaCtxStep] Creating schema context with data: ${JSON.stringify(data)}`
      );
      // 1. Validate input data
      const vData = await createSchemaCtxBase.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[CreateSchemaCtxStep] Invalid input data: ${JSON.stringify(vData.error.errors.map((e) => e.message).join(", "))}`
        );
        throw new Error(
          vData.error.errors.map((e) => e.message).join(", ") ||
            "Invalid input data"
        );
      }

      // 2. Create schema context
      const id = await this.schemaCtxRepo.create(vData.data);

      this.logger.info(
        `[CreateSchemaCtxStep] Created schema context with id: ${id}`
      );

      // 3. Fetch and return created schema context
      const result = await this.schemaCtxRepo.findById(id);

      if (!result) {
        this.logger.error(
          `[CreateSchemaCtxStep] Created schema context with id: ${id} but could not fetch it`
        );
        throw new Error("Created schema context but could not fetch it");
      }

      return result;
    } catch (error) {
      this.logger.error(
        `[CreateSchemaCtxStep] Error creating schema context: `,
        error.message
      );
      throw new Error(error.message || "Error creating schema context");
    }
  }
}
