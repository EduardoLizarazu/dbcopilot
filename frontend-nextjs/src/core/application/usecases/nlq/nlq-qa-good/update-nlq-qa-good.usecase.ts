import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
  updateNlqQaGoodSchema,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { DbConnectionRepository } from "@/infrastructure/repository/dbconnection.repo";

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
    private readonly dbConnRepo: DbConnectionRepository,
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

      // ==== UPDATE KNOWLEDGE BASED ON isOnKnowledgeSource ====
      if (data.isOnKnowledgeSource) {
        // If isOnKnowledgeSource is true, ensure it's in the knowledge base
        await this.knowledgePort.delete(id); // Remove existing entry if any
        await this.knowledgePort.create({
          id: id || existingNlqQaGood.id,
          nlqQaGoodId: id || existingNlqQaGood.id,
          question: data.question || existingNlqQaGood.question,
          query: data.query || existingNlqQaGood.query,
          tablesColumns: data.tablesColumns || existingNlqQaGood.tablesColumns,
        });
        data.knowledgeSourceId =
          data.knowledgeSourceId || existingNlqQaGood.knowledgeSourceId; // Retain existing if not provided
        data.isOnKnowledgeSource = true; // Ensure it's true
      }

      if (!data.isOnKnowledgeSource) {
        await this.knowledgePort.delete(id);
        data.knowledgeSourceId = "";
        data.isOnKnowledgeSource = false;
      }

      // 2. Update NLQ QA Good
      data.isDelete = false; // Ensure isDelete remains false on update
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      this.logger.error(
        `[UpdateNlqQaGoodUseCase] Failed to update NLQ QA Good with ID: ${id}:`,
        errorMessage
      );

      throw new Error(`Failed to update NLQ QA Good: ${errorMessage}`);
    }
  }
}
