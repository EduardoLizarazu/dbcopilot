import {
  createSchemaDto,
  createSchemaInRqDto,
  TCreateInSchemaDto,
  TCreateSchema,
  TSchemaOutRqDto,
} from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface ICreateSchemaStep {
  run(data: TCreateInSchemaDto): Promise<TSchemaOutRqDto>;
}

export class CreateSchemaStep implements ICreateSchemaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}

  async run(data: TCreateInSchemaDto): Promise<TSchemaOutRqDto> {
    try {
      this.logger.info(
        "[CreateSchemaStep] Creating schema:",
        JSON.stringify(data)
      );

      // 1. Validate
      const vData = await createSchemaInRqDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          "[CreateSchemaStep] Validation failed:",
          JSON.stringify(vData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(vData.error.message)
        );
      }

      // 2. Create dto
      const dto: TCreateSchema = {
        connStringRef: [{ ...vData.data }],
      };

      const createVData = await createSchemaDto.safeParseAsync(dto);
      if (!createVData.success) {
        this.logger.error(
          "[CreateSchemaStep] Create DTO Validation failed:",
          JSON.stringify(createVData.error)
        );
        throw new Error(
          "Validation failed: " + JSON.stringify(createVData.error.message)
        );
      }

      //   1. Create the schema context knowledge graph
      const schemaId = await this.schemaRepo.createSchema(createVData.data);

      this.logger.info("[CreateSchemaStep] Created schema with ID:", schemaId);

      //   2. Return the newly created schema ID
      const newDoc = await this.schemaRepo.findById(schemaId);
      if (!newDoc) {
        this.logger.error("[CreateSchemaStep] Schema not found:", schemaId);
        throw new Error("Schema not found");
      }

      return newDoc;
    } catch (error) {
      this.logger.error("[CreateSchemaStep] Error:", error.message);
      throw new Error(error.message || "Error in CreateSchemaStep");
    }
  }
}
