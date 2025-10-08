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
      const dbConnections = await this.dbConnRepo.findAllHaveVbd();
      this.logger.info(
        "[ReadAllDbConnectionHaveVbdUseCase] DB connections fetched successfully",
        dbConnections
      );
      return {
        success: true,
        data: dbConnections,
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
