import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { TVbdOutRequestDto } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IReadAllVbdSplitterUseCase {
  execute(): Promise<TResponseDto<TVbdOutRequestDto[]>>;
}

export class ReadAllVbdSplitterUseCase implements IReadAllVbdSplitterUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository
  ) {}

  async execute(): Promise<TResponseDto<TVbdOutRequestDto[]>> {
    try {
      const vbdSplitters = await this.vbdSplitterRepo.findAll();
      return {
        success: true,
        message: "VBD Splitters retrieved successfully",
        data: vbdSplitters,
      };
    } catch (error) {
      this.logger.error(
        `[ReadAllVbdSplitterUseCase] Error retrieving VBD Splitters: ${error.message}`,
        error
      );
      return {
        success: false,
        message: "Error retrieving VBD Splitters",
        data: null,
      };
    }
  }
}
