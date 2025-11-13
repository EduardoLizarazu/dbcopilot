import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

/**
 * Steps to delete a DB connection:
 * 1. Validate input id
 * 2. Check if the db connection exists, based on id
 * 3. Call repository to delete db connection
 */

export interface IDeleteDbConnStep {
  run(id: string): Promise<void>;
}

export class DeleteDbConnStep implements IDeleteDbConnStep {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository
  ) {}

  async run(id: string): Promise<void> {
    try {
      this.logger.info(
        "[DeleteDbConnStep] Deleting DB connection with id:",
        id
      );
      // Validate input id
      if (!id) {
        throw new Error("Invalid DB connection id");
      }

      // Check if the db connection exists
      const dbConnection = await this.dbConnectionRepo.findById(id);
      if (!dbConnection) {
        throw new Error("DB connection not found");
      }

      // Call repository to delete db connection
      await this.dbConnectionRepo.delete(id);
      this.logger.info("[DeleteDbConnStep] DB connection deleted successfully");
    } catch (error) {
      this.logger.error(
        "[DeleteDbConnStep] Error deleting DB connection:",
        error.message
      );
      throw new Error(error.message || "Error deleting DB connection");
    }
  }
}
