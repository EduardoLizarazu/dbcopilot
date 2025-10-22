import { TSchemaOutRqDto } from "../../dtos/schemaContext.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ISchemaRepository } from "../../interfaces/schema/schema.inter";

export interface IReadSchemaByIdStep {
  run(schemaId: string): Promise<TSchemaOutRqDto>;
}

export class ReadSchemaByIdStep implements IReadSchemaByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly schemaRepo: ISchemaRepository
  ) {}
  async run(schemaId: string): Promise<TSchemaOutRqDto> {
    try {
      this.logger.info("[ReadSchemaByIdStep] Reading schema by ID:", schemaId);
      if (!schemaId || schemaId.trim() === "") {
        this.logger.error("[ReadSchemaByIdStep] Invalid schema ID provided");
        throw new Error("Invalid schema ID");
      }

      const schemaDoc =
        await this.schemaRepo.findSchemaCtxKnowledgeGraphById(schemaId);
      if (!schemaDoc) {
        this.logger.error("[ReadSchemaByIdStep] Schema not found:", schemaId);
        throw new Error("Schema not found");
      }
      this.logger.info(
        "[ReadSchemaByIdStep] Retrieved schema:",
        JSON.stringify(schemaDoc)
      );
      return schemaDoc;
    } catch (error) {
      this.logger.error("[ReadSchemaByIdStep] Error:", error.message);
      throw new Error(error.message || "Error in ReadSchemaByIdStep");
    }
  }
}
