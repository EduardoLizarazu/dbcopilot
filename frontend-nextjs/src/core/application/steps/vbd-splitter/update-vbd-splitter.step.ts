import {
  TUpdateVbdDto,
  TVbdOutRequestDto,
  updateVbdSchema,
} from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

/**
 * Step for updating a VBD Splitter:
 * 1. Validate input data
 * 2. Check if VBD Splitter exists
 * 3. Check if the name is the same as before
 * 4. Check if the name is unique
 * 5. Update VBD Splitter in repository
 * 6. Retrieve updated VBD Splitter
 * 7. Return updated VBD Splitter
 *
 * @param data - Data for updating the VBD Splitter
 * @throws Error if validation fails or update fails
 * @returns The updated VBD Splitter
 */

export interface IUpdateVbdSplitterStep {
  run(data: TUpdateVbdDto): Promise<TVbdOutRequestDto>;
}

export class UpdateVbdSplitterStep implements IUpdateVbdSplitterStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqVbdSplitterRepo: IVbdSplitterRepository
  ) {}
  async run(data: TUpdateVbdDto): Promise<TVbdOutRequestDto> {
    try {
      this.logger.info(
        `[UpdateVbdSplitterStep] Updating VBD Splitter with data: ${JSON.stringify(
          data
        )}`
      );

      //   1. Valid data
      const validData = await updateVbdSchema.safeParseAsync(data);

      if (!validData.success) {
        this.logger.error(
          `[UpdateVbdSplitterStep] Invalid update data: ${JSON.stringify(
            validData.error
          )}`
        );
        throw new Error("Invalid update data: " + validData.error.message);
      }
      const vData = validData.data;

      // 2. Check if VBD Splitter exists
      const existingVbdSplitter = await this.nlqVbdSplitterRepo.findById(
        vData.id
      );
      if (!existingVbdSplitter) {
        this.logger.error(
          `[UpdateVbdSplitterStep] VBD Splitter not found: ${vData.id}`
        );
        throw new Error("VBD Splitter not found: " + vData.id);
      }

      // 3. Check if the name is the same as before
      if (vData.name && vData.name === existingVbdSplitter.name) {
        this.logger.error(
          `[UpdateVbdSplitterStep] New name is the same as the current name: ${vData.name}`
        );
        throw new Error(
          "New name is the same as the current name: " + vData.name
        );
      }

      // 4. Check if the name is unique
      if (vData.name) {
        const nameExists = await this.nlqVbdSplitterRepo.findByName(vData.name);
        if (nameExists && nameExists.id !== vData.id) {
          this.logger.error(
            `[UpdateVbdSplitterStep] VBD Splitter with name already exists: ${vData.name}`
          );
          throw new Error(
            "VBD Splitter with name already exists: " + vData.name
          );
        }
      }

      //   5. Update VBD Splitter
      await this.nlqVbdSplitterRepo.update(vData.id, {
        ...vData,
      });

      //   6. Retrieve updated VBD Splitter
      const updatedVbdSplitter = await this.nlqVbdSplitterRepo.findById(
        vData.id
      );

      if (!updatedVbdSplitter) {
        this.logger.error(
          `[UpdateVbdSplitterStep] VBD Splitter not found after update: ${vData.id}`
        );
        throw new Error("VBD Splitter not found after update: " + vData.id);
      }
      //   7. Return updated VBD Splitter
      return updatedVbdSplitter;
    } catch (error) {
      this.logger.error(
        `[UpdateVbdSplitterStep] Error updating VBD Splitter: ${error.message}`
      );
      throw new Error("Error updating VBD Splitter: " + error.message);
    }
  }
}
