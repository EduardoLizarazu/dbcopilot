import { TDbConnectionOutRequestDtoWithVbd } from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadAllDbConnectionHaveVbdUseCase {
  execute(): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd[]>>;
}

export class ReadAllDbConnectionHaveVbdUseCase
  implements IReadAllDbConnectionHaveVbdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async execute(): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd[]>> {
    try {
      // 1. Fetch all DB connections that have VBD
      const dbConnections = await this.dbConnRepo.findAllHaveVbd();
      this.logger.info(
        "[ReadAllDbConnectionHaveVbdUseCase] DB connections fetched successfully",
        dbConnections
      );

      // 3. Return the list of DB connections with VBD
      const filteredDbConnections = dbConnections.filter(
        (conn) => conn.vbd_splitter !== undefined || conn.vbd_splitter !== null
      );

      return {
        success: true,
        data: filteredDbConnections,
        message: "DB connections fetched successfully",
      };
    } catch (error) {
      this.logger.error(
        "Error fetching DB connections with VBD",
        error.message
      );
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
}
