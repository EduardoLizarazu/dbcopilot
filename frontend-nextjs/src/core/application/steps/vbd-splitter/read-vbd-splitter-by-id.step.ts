import { TVbdOutRequestDto } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IReadVbdSplitterByIdStep {
  run(data: { idSplitter: string }): Promise<TVbdOutRequestDto>;
}

export class ReadVbdSplitterByIdStep implements IReadVbdSplitterByIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqVbdSplitterRepo: IVbdSplitterRepository
  ) {}

  async run(data: { idSplitter: string }): Promise<TVbdOutRequestDto> {
    try {
      this.logger.info(
        `[ReadVbdSplitterByIdStep] Reading VBD Splitter by ID: ${data.idSplitter}`
      );

      if (!data.idSplitter) {
        this.logger.warn(
          `[ReadVbdSplitterByIdStep] Invalid ID provided: ${data.idSplitter}`
        );
        throw new Error("Invalid ID provided");
      }

      const splitter = await this.nlqVbdSplitterRepo.findById(data.idSplitter);
      if (!splitter) {
        this.logger.warn(
          `[ReadVbdSplitterByIdStep] VBD Splitter not found: ${data.idSplitter}`
        );
        throw new Error("VBD Splitter not found");
      }
      return splitter;
    } catch (error) {
      this.logger.error(
        `[ReadVbdSplitterByIdStep] Error reading VBD Splitter by ID: ${error.message}`
      );
      throw new Error(error.message);
    }
  }
}
