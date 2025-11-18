import { TNlqSchemaProfileBasicsDto } from "../../dtos/nlq/nlq-qa-information.app.dto";
import { TSchemaCtxColumnProfileDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IExecuteProfileOnInfoStep } from "../../steps/infoBased/execute-profile-on-info.step";
import { IExtractSchemaBasedStep } from "../../steps/infoBased/extract-schemabased.step";

export interface IProfileExtractorUseCase {
  execute(data: {
    connectionIds: string[];
    schema: TNlqSchemaProfileBasicsDto;
  }): Promise<TSchemaCtxColumnProfileDto | null>;
}

export class ProfileExtractorUseCase implements IProfileExtractorUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly profilePort: IExecuteProfileOnInfoStep,
    private readonly readByIdDbConnStep: IReadDbConnByIdStep,
    private readonly extractSchemaBasedStep: IExtractSchemaBasedStep
  ) {}

  async execute(data: {
    connectionIds: string[];
    schema: TNlqSchemaProfileBasicsDto;
  }): Promise<TSchemaCtxColumnProfileDto | null> {
    try {
      this.logger.info(
        "[ProfileExtractorUseCase] Executing profile extraction with data:",
        JSON.stringify(data)
      );
      //   1. Read connections by IDs
      const connections = data.connectionIds.map(async (connId) => {
        const conn = await this.readByIdDbConnStep.run({ dbConnId: connId });
        if (!conn) {
          this.logger.warn(
            `[ProfileExtractorUseCase] DB Connection not found for ID: ${connId}`
          );
        }
        return conn;
      });
      const resolvedConnections = await Promise.all(connections);
      this.logger.info(
        "[ProfileExtractorUseCase] Resolved connections:",
        JSON.stringify(resolvedConnections)
      );

      //   2. Extract schema based information for each connection
      // and check which one has the schemaName, tableName, columnName, dataType
      let targetConnection = null;
      for (const conn of resolvedConnections) {
        if (!conn) continue;
        const schemaInfo = await this.extractSchemaBasedStep.run({
          ...conn,
        });
        const matchingColumn = schemaInfo.find(
          (col) =>
            col.TABLE_SCHEMA === data.schema.schemaName &&
            col.TABLE_NAME === data.schema.tableName &&
            col.COLUMN_NAME === data.schema.columnName &&
            col.DATA_TYPE === data.schema.dataType
        );
        if (matchingColumn) {
          targetConnection = conn;
          break;
        }
      }

      //   3. If no matching connection found, return null
      if (!targetConnection) {
        this.logger.warn(
          "[ProfileExtractorUseCase] No matching connection found for the provided schema details."
        );
        return null;
      }

      //   4. Execute profile on the found connection
      const profileResult = await this.profilePort.run({
        connection: {
          ...targetConnection,
        },
        schema: data.schema,
      });
      return profileResult;
    } catch (error) {
      this.logger.error(
        "[ProfileExtractorUseCase] Error executing profile extraction:",
        error.message
      );
      throw new Error(error.message || "Error executing profile extraction");
    }
  }
}
