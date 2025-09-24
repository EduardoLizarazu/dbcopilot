import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";

export interface ISoftDeleteNlqQaGoodUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class SoftDeleteNlqQaGoodUseCase implements ISoftDeleteNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate input
      if (!id || id.trim() === "") {
        this.logger.error(
          "[SoftDeleteNlqQaGoodUseCase] Invalid ID provided for soft delete"
        );
        return {
          success: false,
          message: "Invalid ID provided",
          data: null,
        };
      }

      //   2. Verify existence
      const existingRecord = await this.nlqQaGoodRepo.findById(id);
      if (!existingRecord) {
        this.logger.error(
          "[SoftDeleteNlqQaGoodUseCase] NLQ QA Good record not found"
        );
        return {
          success: false,
          message: "NLQ QA Good record not found",
          data: null,
        };
      }

      //   2.1 Remove from knowledge base if exists
      await this.knowledgePort.delete(id);

      //   2.2 Update knowledge base status if needed
      await this.nlqQaGoodRepo.update(id, {
        ...existingRecord,
        knowledgeSourceId: "",
        isOnKnowledgeSource: false,
        updatedAt: new Date(),
      });

      //   3. Perform soft delete (toggle isDelete flag)
      await this.nlqQaGoodRepo.switchSoftDelete(id);

      //   4. Find the updated record to return
      const updatedRecord = await this.nlqQaGoodRepo.findById(id);
      if (!updatedRecord) {
        this.logger.error(
          "[SoftDeleteNlqQaGoodUseCase] Error retrieving updated NLQ QA Good record after soft delete"
        );
        return {
          success: false,
          message: "Error retrieving updated NLQ QA Good record",
          data: null,
        };
      }

      //   5. Return success response
      return {
        success: true,
        message: "NLQ QA Good record soft delete toggled successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        "[SoftDeleteNlqQaGoodUseCase] Error executing soft delete",
        error
      );
      return {
        success: false,
        message: (error as Error).message || "Error executing soft delete",
        data: null,
      };
    }
  }
}
