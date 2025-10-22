import {
  TSchemaOutRqDto,
  TUpdateConnOnSchema,
  TUpdateConnOnSchemaInRqDto,
  updateConnOnSchema,
  updateConnOnSchemaInRqDto,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface IUpdateSchemaStep {
  run(id: string, data: TUpdateConnOnSchemaInRqDto): Promise<TSchemaOutRqDto>;
}

export class UpdateSchemaStep implements IUpdateSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}

  async run(
    id: string,
    data: TUpdateConnOnSchemaInRqDto
  ): Promise<TSchemaOutRqDto> {
    try {
      this.logger.info(
        `[UpdateSchemaStep] Updating schema with ID: ${id}`,
        JSON.stringify(data)
      );

      const vData = await updateConnOnSchemaInRqDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[UpdateSchemaStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }

      const prevSchema = await this.schemaRepo.findById(id);
      if (
        !prevSchema ||
        !prevSchema.id ||
        prevSchema.connStringRef?.length === 0
      ) {
        this.logger.error("[UpdateSchemaStep] Schema not found:", id);
        throw new Error("Schema not found");
      }

      // Add or update the fields of connectionInfo
      const prevConnInfos = prevSchema.connStringRef;
      const newConnInfo = vData.data;
      const updateConnInfos: typeof prevConnInfos = [...prevConnInfos];

      // Iterate over prevConnInfos to find and update matching entries by connection id
      prevConnInfos.forEach((prevInfo, index) => {
        const match = newConnInfo.id === prevInfo.id;
        if (match) {
          updateConnInfos[index] = { ...newConnInfo };
        }
      });

      const updateDto: TUpdateConnOnSchema = {
        connStringRef: updateConnInfos,
      };
      const updateVData = await updateConnOnSchema.safeParseAsync(updateDto);
      if (!updateVData.success) {
        this.logger.error(
          "[UpdateSchemaStep] Update DTO Validation failed:",
          JSON.stringify(updateVData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(updateVData.error.message)
        );
      }

      await this.schemaRepo.updateConnOnSchema(id, updateVData.data);
      this.logger.info("[UpdateSchemaStep] Update successful");
      const updatedDoc = await this.schemaRepo.findById(id);

      if (!updatedDoc) {
        this.logger.error(
          "[UpdateSchemaStep] Schema not found after update:",
          id
        );
        throw new Error("Schema not found after update");
      }

      return updatedDoc;
    } catch (error) {
      this.logger.error("[UpdateSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in UpdateSchemaStep");
    }
  }
}
