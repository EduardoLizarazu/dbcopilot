import {
  dbConnectionInRequestSchema,
  TDbConnectionInRequestDto,
  TDbConnectionOutRequestDto,
  TUpdateDbConnectionDto,
  updateDbConnectionSchema,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IUpdateDbConnectionUseCase {
  execute(
    id: string,
    data: TDbConnectionInRequestDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>>;
}

/**
 * Update db connection use case:
 * 1. Validate input data
 * 2. Check if the db connection exists, based on id
 * 3. Check if the vbd_splitter exists
 * 4. Prepare data for update
 * 5. Call repository to update db connection
 * 6. Find by id the updated db connection
 * 7. Return response
 */

export class UpdateDbConnectionUseCase implements IUpdateDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository,
    private readonly vbdRepo: IVbdSplitterRepository
  ) {}

  async execute(
    id: string,
    data: TDbConnectionInRequestDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>> {
    try {
      this.logger.info(
        "[UpdateDbConnectionUseCase] Handling execute with id and data:",
        { id, ...data }
      );
      //   1. Validate input data
      if (!id || id.trim() === "") {
        this.logger.error(
          `[UpdateDbConnectionUseCase] Invalid id provided: ${id}`
        );
        return {
          success: false,
          message: `Invalid id provided`,
          data: null,
        };
      }

      const validInput = await dbConnectionInRequestSchema.safeParseAsync(data);
      if (!validInput.success) {
        this.logger.error(
          `[UpdateDbConnectionUseCase] Invalid input data: ${JSON.stringify(validInput.error.issues)}`
        );
        return {
          success: false,
          message: `Invalid input data`,
          data: null,
        };
      }

      //   2. Check if the db connection exists, based on id
      const existingConnection = await this.dbConnectionRepo.findById(id);
      if (!existingConnection) {
        this.logger.warn(
          `[UpdateDbConnectionUseCase] DB connection not found: ${id}`
        );
        return {
          success: false,
          message: `DB connection not found`,
          data: null,
        };
      }

      //   3. Check if the vbd_splitter exists
      const vbd = await this.vbdRepo.findById(validInput.data.id_vbd_splitter);
      if (!vbd) {
        this.logger.warn(
          `[UpdateDbConnectionUseCase] VBD splitter not found: ${validInput.data.id_vbd_splitter}`
        );
        return {
          success: false,
          message: `VBD splitter not found`,
          data: null,
        };
      }

      //   4. Prepare data for update
      const updateDto: TUpdateDbConnectionDto = {
        id: existingConnection.id,
        name: validInput.data.name || existingConnection.name,
        description:
          validInput.data.description || existingConnection.description,
        type: validInput.data.type || existingConnection.type,
        host: validInput.data.host || existingConnection.host,
        port: validInput.data.port || existingConnection.port,
        database: validInput.data.database || existingConnection.database,
        username: validInput.data.username || existingConnection.username,
        password: validInput.data.password || existingConnection.password,
        sid: validInput.data.sid || existingConnection.sid,
        schema_query:
          validInput.data.schema_query || existingConnection.schema_query,
        id_vbd_splitter:
          validInput.data.id_vbd_splitter || existingConnection.id_vbd_splitter,
        updatedAt: new Date(),
        updatedBy: validInput.data.actorId,
      };

      this.logger.info(
        "[UpdateDbConnectionUseCase] Prepared update DTO:",
        updateDto
      );

      const updateValid =
        await updateDbConnectionSchema.safeParseAsync(updateDto);

      if (!updateValid.success) {
        this.logger.error(
          `[UpdateDbConnectionUseCase] Invalid update data: ${JSON.stringify(updateValid.error.issues)}`
        );
        return {
          success: false,
          message: `Invalid update data`,
          data: null,
        };
      }

      // 5. Call repository to update db connection
      await this.dbConnectionRepo.update(id, updateValid.data);

      // 6. Find by id the updated db connection
      const updatedConnection = await this.dbConnectionRepo.findById(id);
      if (!updatedConnection) {
        this.logger.warn(
          `[UpdateDbConnectionUseCase] Updated DB connection not found: ${id}`
        );
        return {
          success: false,
          message: `Updated DB connection not found`,
          data: null,
        };
      }

      // 7. Return response

      this.logger.info(
        "[UpdateDbConnectionUseCase] Successfully updated DB connection:",
        updatedConnection
      );

      return {
        success: true,
        message: "DB connection updated successfully",
        data: updatedConnection,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateDbConnectionUseCase] Error updating DB connection: ${error.message}`
      );
      return {
        data: null,
        message: error.message,
        success: false,
      };
    }
  }
}
