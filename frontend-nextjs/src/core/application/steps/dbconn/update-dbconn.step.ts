import {
  TDbConnectionOutRequestDto,
  TUpdateDbConnectionDto,
  updateDbConnectionSchema,
} from "../../dtos/dbconnection.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

/**
 * Update DB Connection Step:
 * 1. Validate input data
 * 2. Check if already exists, based on fields
 * 3. Check if the vbd_splitter exists
 * 4. Check if already exists, based on fields (excluding self)
 * 5. Update the DB connection
 * 6. Find by id the newly Updated db connection
 * 7. Return the newly Updated db connection
 * @param data Data for updating the DB Connection
 * @throws Error if any step fails
 * @returns The newly Updated DB Connection
 */

export interface IUpdateDbConnStep {
  run(data: TUpdateDbConnectionDto): Promise<TDbConnectionOutRequestDto>;
}

export class UpdateDbConnStep implements IUpdateDbConnStep {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository,
    private readonly vbdRepo: IVbdSplitterRepository
  ) {}

  async run(data: TUpdateDbConnectionDto): Promise<TDbConnectionOutRequestDto> {
    try {
      this.logger.info(
        "[UpdateDbConnStep] Updating DB Connection with data:",
        data
      );
      // 1. Validate input data
      const vData = await updateDbConnectionSchema.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[UpdateDbConnStep] Invalid input data: ${JSON.stringify(
            vData.error.issues
          )}`
        );
        throw new Error("Invalid input data: " + vData.error.message);
      }

      const dbConnData = vData.data;

      //   2. Check if already exists, based on id
      const existingDbConn = await this.dbConnRepo.findById(dbConnData.id);
      if (!existingDbConn) {
        this.logger.error(
          `[UpdateDbConnStep] DB Connection not found with id: ${dbConnData.id}`
        );
        throw new Error(`DB Connection not found with id: ${dbConnData.id}`);
      }

      //   3. Check if the vbd_splitter exists
      const vbd = await this.vbdRepo.findById(dbConnData.id_vbd_splitter);
      if (!vbd) {
        this.logger.error(
          `[UpdateDbConnStep] VBD Splitter not found with id: ${dbConnData.id_vbd_splitter}`
        );
        throw new Error(
          `VBD Splitter not found with id: ${dbConnData.id_vbd_splitter}`
        );
      }

      //   4. Check if already exists, based on fields (excluding self)
      const duplicateCheck = await this.dbConnRepo.findByFields(dbConnData);
      if (duplicateCheck && duplicateCheck.id !== dbConnData.id) {
        this.logger.error(
          `[UpdateDbConnStep] DB Connection already exists with fields: ${JSON.stringify(
            duplicateCheck
          )}`
        );
        throw new Error(
          `DB Connection already exists with fields: ${JSON.stringify(
            duplicateCheck
          )}`
        );
      }

      //   5. Update the DB connection
      await this.dbConnRepo.update(dbConnData.id, dbConnData);
      this.logger.info(
        `[UpdateDbConnStep] DB Connection updated successfully with id: ${dbConnData.id}`
      );

      //   6. Find by id the newly Updated db connection
      const updatedDbConn = await this.dbConnRepo.findById(dbConnData.id);
      if (!updatedDbConn) {
        this.logger.error(
          `[UpdateDbConnStep] Error finding updated DB Connection with id: ${dbConnData.id}`
        );
        throw new Error(
          `Error finding updated DB Connection with id: ${dbConnData.id}`
        );
      }

      this.logger.info(
        `[UpdateDbConnStep] Successfully updated DB Connection with id: ${dbConnData.id}`
      );
      return updatedDbConn;
    } catch (error) {
      this.logger.error(
        `[UpdateDbConnStep] Error updating DB Connection: ${error.message}`
      );
      throw new Error(error.message || "Error updating DB Connection");
    }
  }
}
