import { TResponseDto } from "../../dtos/utils/response.app.dto";
import {
  TVbdInRequestDto,
  TVbdOutRequestDto,
  updateVbdSchema,
  vbdInRequestSchema,
} from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IUpdateSplitterNameOnKnowledgeBaseStep } from "../../steps/knowledgeBased/update-splitter-name-on-knowledge-base.step";
import { IReadVbdSplitterByIdStep } from "../../steps/vbd-splitter/read-vbd-splitter-by-id.step";
import { IUpdateVbdSplitterStep } from "../../steps/vbd-splitter/update-vbd-splitter.step";
import { IVbdSplitterValidInputRqUpdateStep } from "../../steps/vbd-splitter/vbd-splitter-valid-input-rq-update.step";

/**
 * UseCase for updating a VBD Splitter:
 * 1. Validate input data
 * 2. Read the existing splitter by ID to get the old name
 * 2. Update namespace in knowledge source
 * 3. Call repository to update VBD splitter
 * 4. Returns the updated VBD Splitter
 *
 * @param id - ID of the VBD Splitter to update
 * @param data - Data for updating the VBD Splitter
 * @throws Error if validation fails or update fails
 * @returns The updated VBD Splitter wrapped in a response DTO
 */

export interface IUpdateVbdSplitterUseCase {
  execute(
    id: string,
    data: TVbdInRequestDto
  ): Promise<TResponseDto<TVbdOutRequestDto>>;
}

export class UpdateVbdSplitterUseCase implements IUpdateVbdSplitterUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readVbdSplitterByIdStep: IReadVbdSplitterByIdStep,
    private readonly validateVbdSplitterInput: IVbdSplitterValidInputRqUpdateStep,
    private readonly updateSplitterNameOnKnowledgeBaseStep: IUpdateSplitterNameOnKnowledgeBaseStep,
    private readonly updateVbdSplitterStep: IUpdateVbdSplitterStep
  ) {}

  async execute(
    id: string,
    data: TVbdInRequestDto
  ): Promise<TResponseDto<TVbdOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateVbdSplitterUseCase] Updating VBD Splitter with ID: ${id}`,
        data
      );
      // 1. Validate input data
      const vData = await this.validateVbdSplitterInput.run(data);

      // 2. Read the existing splitter by ID to get the old name
      const oldSplitter = await this.readVbdSplitterByIdStep.run({
        idSplitter: id,
      });

      // 3. Update namespace in knowledge source if name has changed
      await this.updateSplitterNameOnKnowledgeBaseStep.run({
        oldName: oldSplitter.name,
        newName: vData.name,
      });

      // 4. Call repository to update VBD splitter
      const updateData = { updatedBy: vData.actorId, ...vData };
      delete updateData.actorId; // Remove actorId from update data
      const updatedVbdSplitter = await this.updateVbdSplitterStep.run({
        id,
        ...updateData,
      });

      this.logger.info(
        `[UpdateVbdSplitterUseCase] Successfully updated VBD Splitter with ID: ${id}`,
        updatedVbdSplitter
      );

      return {
        success: true,
        message: "VBD Splitter updated successfully",
        data: updatedVbdSplitter,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateVbdSplitterUseCase] Error updating VBD Splitter: ${error.message}`,
        error
      );
      return {
        success: false,
        message: "Error updating VBD Splitter " + error.message,
        data: null,
      };
    }
  }
}
