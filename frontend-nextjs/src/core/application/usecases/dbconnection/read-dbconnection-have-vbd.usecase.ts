import { TDbConnectionOutRequestDtoWithVbd } from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadDbConnectionWithVbdByIdUseCase {
  execute(id: string): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd>>;
}

export class ReadDbConnectionWithVbdByIdUseCase
  implements IReadDbConnectionWithVbdByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository
  ) {}

  async execute(
    id: string
  ): Promise<TResponseDto<TDbConnectionOutRequestDtoWithVbd>> {
    try {
      const dbConnection = await this.dbConnRepo.findHaveVbdById(id);
      if (!dbConnection) {
        return {
          success: false,
          data: null,
          message: "DB connection not found",
        };
      }
      if (
        dbConnection.vbd_splitter === null ||
        dbConnection.vbd_splitter === undefined
      ) {
        return {
          success: false,
          data: null,
          message: "DB connection does not have VBD",
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
