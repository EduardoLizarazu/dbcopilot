import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

/**
 * Business rules for deleting a VBD Splitter:
 * 1. Validate input (id must be valid and not empty)
 * 2. Check if VBD Splitter exists
 * 3. Check if is active in any Db Connection
 * 3.1 If active, prevent deletion and return an error
 * 4. Update all NLQ QA Goods that use this VBD Splitter to set vbdSplitterId to null
 * 5. Remove from knowledge source everything with the namespace
 * 6. Delete the VBD Splitter
 * 7. Return success response
 */

export interface IDeleteVbdSplitterUseCase {
  execute(id: string): Promise<TResponseDto<void>>;
}

export class DeleteVbdSplitterUseCase implements IDeleteVbdSplitterUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly vbdSplitterRepo: IVbdSplitterRepository,
    private readonly dbConnRepo: IDbConnectionRepository,
    private readonly nlqGoodRepo: INlqQaGoodRepository,
    private readonly nlqQaKnowledgePort: INlqQaKnowledgePort
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

      // 2. Check if VBD Splitter exists

      // 3. Check if is active in any Db Connection

      // 4. Check if any NLQ QA Good is using this VBD Splitter

      // 5. Remove from knowledge source everything with the namespace
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
