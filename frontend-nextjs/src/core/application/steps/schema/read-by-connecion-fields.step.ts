import {
  readByConnectionFieldsDto,
  TReadByConnectionFieldsDto,
  TSchemaCtxKnowledgeGraphOutRq,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaCtxKnowledgeGraphRepository } from "../../interfaces/schema/schema.inter";

export interface IReadSchemaByConnectionFieldsStep {
  run(data: TReadByConnectionFieldsDto): Promise<TSchemaCtxKnowledgeGraphOutRq>;
}

export class ReadSchemaByConnectionFieldsStep
  implements IReadSchemaByConnectionFieldsStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaCtxKnowledgeGraphRepository
  ) {}

  async run(
    data: TReadByConnectionFieldsDto
  ): Promise<TSchemaCtxKnowledgeGraphOutRq> {
    try {
      this.logger.info(
        "[ReadSchemaByConnectionFieldsStep] Reading schema by connection fields:",
        JSON.stringify(data)
      );
      //   1. Validate input
      const vData = await readByConnectionFieldsDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[ReadSchemaByConnectionFieldsStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }

      const result = await this.schemaRepo.findByConnectionFields(data);
      this.logger.info(
        "[ReadSchemaByConnectionFieldsStep] Successfully read schema by connection fields:",
        JSON.stringify(result)
      );
      return result;
    } catch (error) {
      this.logger.error(
        "[ReadSchemaByConnectionFieldsStep] Error reading schema by connection fields:",
        error
      );
      throw new Error(
        error.message || "Error in ReadSchemaByConnectionFieldsStep"
      );
    }
  }
}
