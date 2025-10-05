import { TDbConnectionOutRequestDtoWithVbd } from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface TReadDbConnectionWithVbdByIdUseCase {
  execute(id: string): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd>>;
}

export class ReadDbConnectionWithVbdByIdUseCase
  implements TReadDbConnectionWithVbdByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async execute(
    id: string
  ): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd>> {
    try {
      const dbConnection = await this.dbConnRepo.findWithVbdById(id);
      if (!dbConnection) {
        return {
          success: false,
          data: null,
          message: "DB connection not found",
        };
      }
      return {
        success: true,
        data: dbConnection,
        message: "DB connection fetched successfully",
      };
    } catch (error) {
      this.logger.error("Error fetching DB connection with VBD", error.message);
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
}
