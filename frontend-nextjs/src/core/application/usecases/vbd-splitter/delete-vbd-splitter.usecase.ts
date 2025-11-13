import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadAllDbConnBySplitterIdStep } from "../../steps/dbconn/read-all-dbconn-by-splitter-id.step";
import { IDeleteSplitterOnKnowledgeBaseStep } from "../../steps/knowledgeBased/delete-splitter-on-knowledge-base.step";
import { IDeleteVbdSplitterByIdStep } from "../../steps/vbd-splitter/delete-vbd-splitter-by-id.step";
import { IReadVbdSplitterByIdStep } from "../../steps/vbd-splitter/read-vbd-splitter-by-id.step";

/**
 * Business rules for deleting a VBD Splitter:
 * 1. Validate input
 * 2. Check if VBD Splitter exists
 * 3. Check if is active in any Db Connection
 * 3.1 If active, prevent deletion and return an error
 * 3.2 If not active, next step
 * 4. Remove from knowledge source everything with the namespace
 * 5. Delete the VBD Splitter
 * 6. Return success response
 */

export interface IDeleteVbdSplitterUseCase {
  execute(id: string): Promise<TResponseDto<void>>;
}

export class DeleteVbdSplitterUseCase implements IDeleteVbdSplitterUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly checkIfVbdSplitterExists: IReadVbdSplitterByIdStep,
    private readonly checkIfVbdSplitterIsUsedInDbConnections: IReadAllDbConnBySplitterIdStep,
    private readonly deleteSplitterOnKnowledgeBase: IDeleteSplitterOnKnowledgeBaseStep,
    private readonly deleteVbdSplitterByIdStep: IDeleteVbdSplitterByIdStep
  ) {}
  async execute(id: string): Promise<TResponseDto<void>> {
    try {
      // 1. Valid input
      if (!id || id.trim() === "") {
        this.logger.error(
          "[DeleteVbdSplitterService] Invalid VBD splitter id",
          { id }
        );
        throw new Error("Invalid VBD splitter id");
      }

      this.logger.info(
        `[DeleteVbdSplitterService] Deleting VBD splitter with id: ${id}`
      );

      // 2. Check if VBD Splitter exists
      const existingSplitter = await this.checkIfVbdSplitterExists.run({
        idSplitter: id,
      });

      // 3. Check if is active in any Db Connection
      const associatedDbConnections =
        await this.checkIfVbdSplitterIsUsedInDbConnections.run({
          vbdSplitterIdrId: id,
        });

      if (associatedDbConnections.length > 0) {
        this.logger.error(
          `[DeleteVbdSplitterService] Cannot delete VBD splitter with id: ${id} as it is associated with active DB connections`,
          { associatedDbConnections }
        );
        return {
          success: false,
          message: `Cannot delete VBD splitter as it is associated with active DB connections`,
          data: null,
        };
      }

      // 4. Remove from knowledge source everything with the namespace
      await this.deleteSplitterOnKnowledgeBase.run({
        splitterName: existingSplitter.name,
      });

      // 5. Delete the VBD Splitter
      await this.deleteVbdSplitterByIdStep.run({ splitterId: id });
      this.logger.info(
        `[DeleteVbdSplitterService] Successfully deleted VBD splitter with id: ${id}`
      );

      return {
        success: true,
        message: "VBD splitter deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteVbdSplitterService] Error deleting VBD splitter: ${error.message}`,
        { id }
      );
      return {
        success: false,
        message: error.message || "Error deleting VBD splitter",
        data: null,
      };
    }
  }
}
