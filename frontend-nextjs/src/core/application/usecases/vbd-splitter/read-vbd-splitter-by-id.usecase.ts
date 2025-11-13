import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { TVbdOutRequestDto } from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";

export interface IReadVbdSplitterByIdUseCase {
  execute(id: string): Promise<TResponseDto<TVbdOutRequestDto>>;
}

export class ReadVbdSplitterByIdUseCase implements IReadVbdSplitterByIdUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<TVbdOutRequestDto>> {
    try {
      this.logger.info(
        `[ReadVbdSplitterUseCase] Retrieving VBD Splitter with ID: ${id}`
      );
      const vbdSplitter = await this.vbdSplitterRepo.findById(id);
      if (!vbdSplitter) {
        return {
          success: false,
          message: "VBD Splitter not found",
          data: null,
        };
      }
      return {
        success: true,
        message: "VBD Splitter retrieved successfully",
        data: vbdSplitter,
      };
    } catch (error) {
      this.logger.error(
        `[ReadVbdSplitterUseCase] Error retrieving VBD Splitter: ${error.message}`,
        error
      );
      return {
        success: false,
        message: "Error retrieving VBD Splitter",
        data: null,
      };
    }
  }
}
