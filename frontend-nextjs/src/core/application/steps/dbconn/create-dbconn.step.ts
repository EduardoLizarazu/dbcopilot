import {
  createDbConnectionSchema,
  TCreateDbConnectionDto,
  TDbConnectionOutRequestDto,
} from "../../dtos/dbconnection.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

/**
 * Create DB Connection Step:
 * 1. Validate input data
 * 2. Check if already exists, based on fields
 * 3. Check if the vbd_splitter exists
 * 4. Create the DB connection
 * 4. Find by id the newly created db connection
 * 5. Return the newly created db connection
 * @param data Data for creating the DB Connection
 * @throws Error if any step fails
 * @returns The newly created DB Connection
 */

export interface ICreateDbConnStep {
  run(data: TCreateDbConnectionDto): Promise<TDbConnectionOutRequestDto>;
}

export class CreateDbConnStep implements ICreateDbConnStep {
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnRepo: IDbConnectionRepository,
    private readonly vbdRepo: IVbdSplitterRepository
  ) {}

  async run(data: TCreateDbConnectionDto): Promise<TDbConnectionOutRequestDto> {
    try {
      this.logger.info(
        "[CreateDbConnStep] Creating DB Connection with data:",
        data
      );
      // 1. Validate input data
      const vData = await createDbConnectionSchema.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[CreateDbConnStep] Invalid input data: ${JSON.stringify(
            vData.error.issues
          )}`
        );
        throw new Error(
          `Invalid input data: ${JSON.stringify(vData.error.message)}`
        );
      }
      const validData = vData.data;

      // 2. Check if already exists, based on fields
      const existing = await this.dbConnRepo.findByFields(validData);
      if (existing) {
        this.logger.error(
          `[CreateDbConnStep] DB Connection already exists with provided fields`
        );
        throw new Error(`DB Connection already exists with provided fields`);
      }

      // 3. Check if the vbd_splitter exists
      const vbd = await this.vbdRepo.findById(validData.id_vbd_splitter);
      if (!vbd) {
        this.logger.error(
          `[CreateDbConnStep] VBD Splitter not found with ID: ${validData.id_vbd_splitter}`
        );
        throw new Error(`VBD Splitter not found with provided ID`);
      }

      // 4. Create the DB connection
      const dbConnId = await this.dbConnRepo.create(validData);
      if (!dbConnId) {
        this.logger.error(`[CreateDbConnStep] Failed to create DB Connection`);
        throw new Error(`Failed to create DB Connection`);
      }

      // 5. Find by id the newly created db connection
      const newDbConn = await this.dbConnRepo.findById(dbConnId);
      if (!newDbConn) {
        this.logger.error(
          `[CreateDbConnStep] Newly created DB Connection not found with ID: ${dbConnId}`
        );
        throw new Error(`Newly created DB Connection not found`);
      }

      this.logger.info(
        `[CreateDbConnStep] DB Connection created successfully with ID: ${dbConnId}`,
        newDbConn
      );
      return newDbConn;
    } catch (error) {
      this.logger.error("[CreateDbConnStep] Error:", error.message);
      throw new Error(error.message);
    }
  }
}
