import { TResponseDto } from "../../dtos/utils/response.app.dto";
import {
  createVbdSchema,
  TCreateVbdDto,
  TVbdInRequestDto,
  TVbdOutRequestDto,
  vbdInRequestSchema,
} from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

export interface ICreateVbdSplitterUseCase {
  execute(data: TVbdInRequestDto): Promise<TResponseDto<TVbdOutRequestDto>>;
}

export class CreateVbdSplitterUseCase implements ICreateVbdSplitterUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository
  ) {}
  async execute(
    data: TVbdInRequestDto
  ): Promise<TResponseDto<TVbdOutRequestDto>> {
    try {
      // 1. Validate input data
      const validData = await vbdInRequestSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[CreateVbdSplitterUseCase] Invalid input data: ${JSON.stringify(validData.error)}`,
          data
        );
        return {
          success: false,
          message: "Invalid input data",
          data: null,
        };
      }

      const dto: TCreateVbdDto = {
        ...data,
        name: data.name.trim().toLowerCase(),
        updatedBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validCreationData = await createVbdSchema.safeParseAsync(dto);
      if (!validCreationData.success) {
        this.logger.error(
          `[CreateVbdSplitterUseCase] Invalid VBD creation data: ${JSON.stringify(validCreationData.error)}`,
          dto
        );
        return {
          success: false,
          message: "Invalid VBD creation data",
          data: null,
        };
      }

      // 2. Call repository to create VBD splitter
      const createdSplitterId = await this.vbdSplitterRepo.create(dto);
      this.logger.info(
        `[CreateVbdSplitterUseCase] VBD splitter created successfully`,
        createdSplitterId
      );

      //   3. Retrieve the created splitter details
      const createdSplitter =
        await this.vbdSplitterRepo.findById(createdSplitterId);
      if (!createdSplitter) {
        this.logger.error(
          `[CreateVbdSplitterUseCase] Created VBD splitter not found`,
          { id: createdSplitterId }
        );
        return {
          success: false,
          message: "Created VBD splitter not found",
          data: null,
        };
      }

      this.logger.info(
        `[CreateVbdSplitterUseCase] Created VBD splitter details retrieved successfully`,
        createdSplitter
      );

      return {
        success: true,
        message: "VBD splitter created successfully",
        data: createdSplitter,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error("Error creating VBD splitter", {
        message: errorMessage,
      });

      throw new Error(`Error creating VBD splitter: ${errorMessage}`);
    }
  }
}
