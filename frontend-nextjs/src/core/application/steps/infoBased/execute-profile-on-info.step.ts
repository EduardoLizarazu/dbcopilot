import {
  connDto,
  schemaProfileBasics,
  TNlqInfoConnDto,
  TNlqSchemaProfileBasicsDto,
} from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TSchemaCtxColumnProfileDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "../../ports/nlq-qa-information.port";

export interface IExecuteProfileOnInfoStep {
  run(data: {
    connection: TNlqInfoConnDto;
    schema: TNlqSchemaProfileBasicsDto;
  }): Promise<TSchemaCtxColumnProfileDto | null>;
}

export class ExecuteProfileOnInfoStep implements IExecuteProfileOnInfoStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaInformationPort: INlqQaInformationPort
  ) {}
  async run(data: {
    connection: TNlqInfoConnDto;
    schema: TNlqSchemaProfileBasicsDto;
  }): Promise<TSchemaCtxColumnProfileDto | null> {
    try {
      this.logger.info(
        "[ExecuteProfileOnInfoStep] Running profile on info with data:",
        JSON.stringify(data)
      );
      const vConnection = await connDto.safeParseAsync(data.connection);
      const vSchema = schemaProfileBasics.safeParse(data.schema);
      if (!vConnection.success || !vSchema.success) {
        this.logger.error(
          "[ExecuteProfileOnInfoStep] Invalid data:",
          vConnection.error.format()
        );
        throw new Error("Invalid data");
      }

      const profile = await this.nlqQaInformationPort.extractProfile({
        connection: vConnection.data,
        schema: vSchema.data,
      });
      return profile;
    } catch (error) {
      this.logger.error(
        "[ExecuteProfileOnInfoStep] Error executing profile on info:",
        error.message
      );
      throw new Error(error.message || "Error executing profile on info");
    }
  }
}
