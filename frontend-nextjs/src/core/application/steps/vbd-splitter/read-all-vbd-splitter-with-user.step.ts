import { TVbdSplitterWithUserDto } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IReadAllVbdSplitterWithUserStep {
  run(): Promise<TVbdSplitterWithUserDto[]>;
}

export class ReadAllVbdSplitterWithUserStep
  implements IReadAllVbdSplitterWithUserStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository
  ) {}
  async run(): Promise<TVbdSplitterWithUserDto[]> {
    try {
      this.logger.info(
        "[ReadAllVbdSplitterWithUserStep] Reading all VBD splitters with user"
      );
      const vbdSplitters =
        await this.vbdSplitterRepo.findAllVbdSplitterWithUser();
      this.logger.info(
        "[ReadAllVbdSplitterWithUserStep] Successfully read VBD splitters with user",
        vbdSplitters
      );
      return vbdSplitters;
    } catch (error) {
      this.logger.error(
        "[ReadAllVbdSplitterWithUserStep] Error reading VBD splitters with user",
        error.message
      );
      throw new Error(
        error.message || "Failed to read VBD splitters with user"
      );
    }
  }
}
