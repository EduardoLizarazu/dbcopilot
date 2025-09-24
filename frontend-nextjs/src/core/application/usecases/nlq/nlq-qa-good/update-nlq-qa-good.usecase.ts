import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
  updateNlqQaGoodSchema,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";

export interface IUpdateNlqQaGoodUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaGoodDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

export class UpdateNlqQaGoodUseCase implements IUpdateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}
  async execute(
    id: string,
    data: TUpdateNlqQaGoodDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Updating NLQ QA Good with ID: ${id}`,
        data
      );

      // 1. Validate data
      if (!id) {
        this.logger.error("[UpdateNlqQaGoodUseCase] ID is required");
        return {
          data: null,
          message: "ID is required",
          success: false,
        };
      }
      const dataValidate = await updateNlqQaGoodSchema.safeParseAsync(data);
      if (!dataValidate.success) {
        this.logger.error(
          `[UpdateNlqQaGoodUseCase] Invalid data: ${JSON.stringify(
            dataValidate.error.issues
          )}`
        );
        return {
          data: null,
          message: "Invalid data",
          success: false,
        };
      }

      // 2. Find existing NLQ QA Good
      const existingNlqQaGood = await this.nlqQaGoodRepository.findById(id);
      if (!existingNlqQaGood) {
        this.logger.error(
          `[UpdateNlqQaGoodUseCase] NLQ QA Good with ID: ${id} not found`
        );
        return {
          data: null,
          message: "NLQ QA Good not found",
          success: false,
        };
      }

      // ==== KNOWLEDGE BASE SWITCHING LOGIC ====
      if (!data.isOnKnowledgeSource) {
        // If isOnKnowledgeSource is false, remove from knowledge base
        await this.knowledgePort.delete(id);
        data.isOnKnowledgeSource = false; // Ensure it's false
        data.knowledgeSourceId = ""; // Clear knowledgeSourceId
      }

      // 2. Update NLQ QA Good
      await this.nlqQaGoodRepository.update(id, data);

      // 3. Find updated NLQ QA Good
      const updatedNlqQaGood = await this.nlqQaGoodRepository.findById(id);
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Successfully updated NLQ QA Good with ID: ${id}`,
        updatedNlqQaGood
      );
      if (!updatedNlqQaGood) {
        return {
          data: null,
          message: "NLQ QA Good not found after update",
          success: false,
        };
      }

      // 4. Return success response
      return {
        data: updatedNlqQaGood,
        message: "NLQ QA Good updated successfully",
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateNlqQaGoodUseCase] Failed to update NLQ QA Good with ID: ${id}`,
        error
      );
      throw new Error("Failed to update NLQ QA Good");
    }
  }
}
