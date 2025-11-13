import { TDbConnectionOutRequestDto } from "../../dtos/dbconnection.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

/**
 * Steps to read a DB connection by ID:
 * 1. Validate input id
 * 2. Check if the db connection exists, based on id
 * 2.1 If not found, throw an error
 * 3. Return the db connection data
 */

export interface IReadDbConnByIdStep {
  run(data: { dbConnId: string }): Promise<TDbConnectionOutRequestDto>;
}

export class ReadDbConnByIdStep implements IReadDbConnByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository // Assume this repository is implemented elsewhere
  ) {}

  async run(data: { dbConnId: string }): Promise<TDbConnectionOutRequestDto> {
    try {
      this.logger.info(
        `[ReadDbConnByIdStep] Reading DB Connection by ID: ${data.dbConnId}`
      );
      if (!data.dbConnId || data.dbConnId.trim() === "") {
        this.logger.error(
          "[ReadDbConnByIdStep] Invalid DB Connection ID",
          data
        );
        throw new Error("Invalid DB Connection ID");
      }
      const dbConnection = await this.dbConnectionRepo.findById(data.dbConnId);
      if (!dbConnection) {
        this.logger.error("[ReadDbConnByIdStep] DB Connection not found", data);
        throw new Error("DB Connection not found");
      }
      return dbConnection;
    } catch (error) {
      this.logger.error(
        `[ReadDbConnByIdStep] Error reading DB Connection by ID: ${error.message}`,
        data
      );
      throw new Error(error.message || "Error reading DB Connection by ID");
    }
  }
}
