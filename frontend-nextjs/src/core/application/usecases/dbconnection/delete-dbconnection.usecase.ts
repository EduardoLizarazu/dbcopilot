import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IDeleteDbConnectionUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

/**
 * Delete db connection use case:
 * 1. Validate input id
 * 2. Check if the db connection exists, based on id
 * 3. Call repository to delete db connection
 * ... There some logic to check on other entities that might use this db connection
 * n. Return response
 */

export class DeleteDbConnectionUseCase implements IDeleteDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      this.logger.info(
        "[DeleteDbConnectionUseCase] Handling execute with id:",
        id
      );
      //   1. Validate input id
      if (!id || id.trim() === "") {
        this.logger.error(
          `[DeleteDbConnectionUseCase] Invalid id provided: ${id}`
        );
        return {
          success: false,
          message: `Invalid id provided`,
          data: null,
        };
      }

      //   2. Check if the db connection exists, based on id
      const existingConnection = await this.dbConnectionRepo.findById(id);
      if (!existingConnection) {
        this.logger.error(
          `[DeleteDbConnectionUseCase] DB connection not found with id: ${id}`
        );
        return {
          success: false,
          message: `DB connection not found`,
          data: null,
        };
      }

      //   3. Call repository to delete db connection
      await this.dbConnectionRepo.delete(id);
      this.logger.info(
        `[DeleteDbConnectionUseCase] Deleted DB connection with id: ${id}`
      );

      //   n. Return response
      return {
        success: true,
        message: `DB connection deleted successfully`,
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteDbConnectionUseCase] Error deleting DB connection with id ${id}: ${error.message}`
      );
      return {
        success: false,
        message: `Error deleting DB connection: ${error.message}`,
        data: null,
      };
    }
  }
}
