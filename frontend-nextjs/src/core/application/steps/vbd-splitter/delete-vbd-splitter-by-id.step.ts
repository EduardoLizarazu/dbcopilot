import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IDeleteVbdSplitterByIdStep {
  run(data: { splitterId: string }): Promise<void>;
}

export class DeleteVbdSplitterByIdStep implements IDeleteVbdSplitterByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository
  ) {}

  async run(data: { splitterId: string }): Promise<void> {
    try {
      this.logger.info(
        `[DeleteVbdSplitterByIdStep] Deleting VBD Splitter with ID: ${data.splitterId}`
      );

      //   1. Validate input
      if (!data.splitterId || data.splitterId.trim() === "") {
        this.logger.error(
          "[DeleteVbdSplitterByIdStep] Invalid Splitter ID",
          data
        );
        throw new Error("Invalid Splitter ID");
      }

      //   2. Call repository to delete VBD splitter

      await this.vbdSplitterRepo.delete(data.splitterId);
      this.logger.info(
        `[DeleteVbdSplitterByIdStep] Successfully deleted VBD Splitter with ID: ${data.splitterId}`
      );
    } catch (error) {
      this.logger.error(
        `[DeleteVbdSplitterByIdStep] Error deleting VBD Splitter with ID: ${data.splitterId}`,
        error
      );
      throw new Error(`Error deleting VBD Splitter: ${error.message}`);
    }
  }
}
