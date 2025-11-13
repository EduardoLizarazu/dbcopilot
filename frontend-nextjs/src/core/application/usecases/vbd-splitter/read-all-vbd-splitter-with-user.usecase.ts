import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { TVbdSplitterWithUserDto } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadAllVbdSplitterWithUserStep } from "../../steps/vbd-splitter/read-all-vbd-splitter-with-user.step";

export interface IReadAllVbdSplitterWithUserUseCase {
  execute(): Promise<TResponseDto<TVbdSplitterWithUserDto[]>>;
}

export class ReadAllVbdSplitterWithUserUseCase
  implements IReadAllVbdSplitterWithUserUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readAllVbdSplitterWithUserStep: IReadAllVbdSplitterWithUserStep
  ) {}

  async execute(): Promise<TResponseDto<TVbdSplitterWithUserDto[]>> {
    try {
      const vbdSplittersWithUser =
        await this.readAllVbdSplitterWithUserStep.run();
      return {
        success: true,
        message: "VBD Splitters with user retrieved successfully",
        data: vbdSplittersWithUser,
      };
    } catch (error) {
      this.logger.error(
        `[ReadVbdSplitterWithUserUseCase] Error retrieving VBD Splitters with user:`,
        error.message
      );
      return {
        success: false,
        message: error.message || "Error retrieving VBD Splitters with user",
        data: null,
      };
    }
  }
}
