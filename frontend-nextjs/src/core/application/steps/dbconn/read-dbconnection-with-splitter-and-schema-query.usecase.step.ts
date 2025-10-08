import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { IDbConnectionRepository } from "@/core/application/interfaces/dbconnection.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export interface IReadDbConnectionWithSplitterAndSchemaQueryStep {
  run(
    dbConnectionId: string
  ): Promise<TDbConnectionOutRequestDtoWithVbAndUser | null>;
}

export class ReadDbConnectionWithSplitterAndSchemaQueryStep
  implements IReadDbConnectionWithSplitterAndSchemaQueryStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async run(
    dbConnectionId: string
  ): Promise<TDbConnectionOutRequestDtoWithVbAndUser | null> {
    try {
      this.logger.info(
        `[ReadDbConnectionWithSplitterStep] Reading DB Connection with ID: ${dbConnectionId}`
      );
      const dbConnWithVbdAndUser =
        await this.dbConnRepo.findWithVbdAndUserById(dbConnectionId);
      //   Validate if it exists and and has a vbd_splitter and has schema_query

      if (!dbConnWithVbdAndUser) {
        this.logger.error(
          `[ReadDbConnectionWithSplitterStep] Database connection with ID: ${dbConnectionId} not found`
        );
        throw new Error("Database connection not found");
      }

      if (!dbConnWithVbdAndUser.vbd_splitter?.name) {
        this.logger.error(
          `[ReadDbConnectionWithSplitterStep] Database connection with ID: ${dbConnectionId} does not have a vbd_splitter`
        );
        throw new Error("Database connection not have a vbd_splitter name");
      }

      if (!dbConnWithVbdAndUser.schema_query) {
        this.logger.error(
          `[ReadDbConnectionWithSplitterStep] Database connection with ID: ${dbConnectionId} does not have a schema_query`
        );
        throw new Error("Database connection not have a schema_query");
      }

      return dbConnWithVbdAndUser;
    } catch (error) {
      this.logger.error(
        "[ReadDbConnectionWithSplitterStep] Error reading DB Connection:",
        error
      );
      throw new Error(
        "Error reading DB Connection: " + (error as Error).message
      );
    }
  }
}
