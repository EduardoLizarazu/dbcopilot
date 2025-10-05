import { TDbConnectionOutRequestDtoWithVbd } from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadAllDbConnectionWithVbdUseCase {
  execute(): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd[]>>;
}

export class ReadAllDbConnectionWithVbdUseCase
  implements IReadAllDbConnectionWithVbdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async execute(): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd[]>> {
    try {
      const dbConnections = await this.dbConnRepo.findAllWithVbd();
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
