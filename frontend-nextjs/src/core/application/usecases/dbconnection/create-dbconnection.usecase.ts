import {
  createDbConnectionSchema,
  dbConnectionInRequestSchema,
  TCreateDbConnectionDto,
  TDbConnectionInRequestDto,
  TDbConnectionOutRequestDto,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface ICreateDbConnectionUseCase {
  execute(
    data: TDbConnectionInRequestDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>>;
}

/**
 * Create db connection use case:
 * 1. Validate input data
 * 2. Check if not already exists, based on fields
 * 3. Check if the vbd_splitter exists
 * 4. Prepare data for creation
 * 5. Call repository to create db connection
 * 6. Find by id the newly created db connection
 * 7. Return response
 */

export class CreateDbConnectionUseCase implements ICreateDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository,
    private readonly vbdRepo: IVbdSplitterRepository
  ) {}

  async execute(
    data: TDbConnectionInRequestDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>> {
    try {
      this.logger.info(
        "[CreateDbConnectionUseCase] Handling execute with data:",
        data
      );

      // 1. Validate input data
      const inputValidate =
        await dbConnectionInRequestSchema.safeParseAsync(data);
      if (!inputValidate.success) {
        this.logger.error(
          `[CreateDbConnectionUseCase] Invalid input data: ${JSON.stringify(
            inputValidate.error.issues
          )}`
        );
        return {
          success: false,
          message: `Invalid input data`,
          data: null,
        };
      }

      //   2. Check if not already exists, based on fields of data
      const existingConnection = await this.dbConnectionRepo.findByFields(
        inputValidate.data
      );
      if (!existingConnection) {
        this.logger.warn(
          `[CreateDbConnectionUseCase] DB connection does not exist: ${JSON.stringify(
            existingConnection
          )}`
        );
        return {
          success: false,
          message: `DB connection does not exist`,
          data: null,
        };
      }

      //   3. Check if the vbd_splitter exists
      const vbd = await this.vbdRepo.findById(
        inputValidate.data.id_vbd_splitter
      );
      if (!vbd) {
        this.logger.warn(
          `[CreateDbConnectionUseCase] VBD splitter does not exist: ${inputValidate.data.id_vbd_splitter}`
        );
        return {
          success: false,
          message: `VBD splitter does not exist`,
          data: null,
        };
      }

      //   4. Prepare data for creation
      const createDto: TCreateDbConnectionDto = {
        type: inputValidate.data.type,
        host: inputValidate.data.host,
        port: inputValidate.data.port,
        database: inputValidate.data.database,
        username: inputValidate.data.username,
        password: inputValidate.data.password,
        createdBy: inputValidate.data.actorId,
        id_vbd_splitter: inputValidate.data.id_vbd_splitter,
      };
      const createDataValid =
        await createDbConnectionSchema.safeParseAsync(createDto);

      if (!createDataValid.success) {
        this.logger.error(
          `[CreateDbConnectionUseCase] Invalid create data: ${JSON.stringify(
            createDataValid.error.issues
          )}`
        );
        return {
          success: false,
          message: `Invalid create data`,
          data: null,
        };
      }
      this.logger.info(
        "[CreateDbConnectionUseCase] Create data validated successfully",
        createDataValid.data
      );

      //   5. Call repository to create db connection
      const newId = await this.dbConnectionRepo.create(createDataValid.data);
      if (!newId) {
        this.logger.error(
          `[CreateDbConnectionUseCase] Failed to create DB connection`
        );
        return {
          success: false,
          message: `Failed to create DB connection`,
          data: null,
        };
      }

      //   6. Find by id the newly created db connection
      const newDbConnection = await this.dbConnectionRepo.findById(newId);
      if (!newDbConnection) {
        this.logger.error(
          `[CreateDbConnectionUseCase] Failed to retrieve newly created DB connection with id ${newId}`
        );
        return {
          success: false,
          message: `Failed to retrieve newly created DB connection`,
          data: null,
        };
      }

      this.logger.info(
        "[CreateDbConnectionUseCase] Successfully created DB connection:",
        newDbConnection
      );

      //   7. Return response

      return {
        success: true,
        message: "DB connection created successfully",
        data: newDbConnection,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`[CreateDbConnectionUseCase] Error: ${errorMessage}`);
      return {
        success: false,
        message: `Error creating DB connection: ${errorMessage}`,
        data: null,
      };
    }
  }
}
