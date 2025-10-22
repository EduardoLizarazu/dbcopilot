import { TSchemaOutRqDto } from "../../dtos/schemaContext.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadAllSchemaStep } from "../../steps/schema/read-all-schema.step";

export interface IReadAllSchemaUseCase {
  execute(): Promise<TResponseDto<TSchemaOutRqDto[]>>;
}

export class ReadAllSchemaUseCase implements IReadAllSchemaUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllSchemaStep: IReadAllSchemaStep
  ) {}
  async execute(): Promise<TResponseDto<TSchemaOutRqDto[]>> {
    try {
      this.logger.info("Executing ReadAllSchemaUseCase");
      const schemas = await this.readAllSchemaStep.run();
      return {
        success: true,
        message: "Schemas retrieved successfully",
        data: schemas,
      };
    } catch (error) {
      this.logger.error("Error reading all schemas", error.message);
      return {
        success: false,
        message: error.message || "Error reading all schemas",
        data: [],
      };
    }
  }
}
