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

/**
 * Use case for updating an existing NLQ QA Good entry:
 * 1. Validates the input data and ID.
 * 2. Finds the existing NLQ QA Good entry by ID.
 * 3. Ensures the associated database connection exists.
 * 4. Handles knowledge base updates based on the isOnKnowledgeSource flag:
 *  a. If false, removes the entry from the knowledge base.
 * b. If true, deletes any existing entry and adds the updated entry to the knowledge base.
 * 5. Updates the NLQ QA Good entry in the repository.
 * 6. Retrieves the updated NLQ QA Good entry.
 * 7. Returns the updated NLQ QA Good entry or an error message if any step fails.
 */

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

      // 3. Ensure dbConnection exists if dbConnectionId is being updated
      const dbConnWithVbdAndUser = await this.dbConnRepo.findWithVbdAndUserById(
        data.dbConnectionId
      );
      if (!dbConnWithVbdAndUser) {
        this.logger.error(
          "[CreateNlqQaGoodUseCase] Database connection not found"
        );
        return {
          success: false,
          message: "Database connection not found",
          data: null,
        };
      }
      if (!dbConnWithVbdAndUser.vbd_splitter?.name) {
        this.logger.error(
          "[CreateNlqQaGoodUseCase] not found for the connection with vbd splitter"
        );
        return {
          success: false,
          message: "not found for the connection with vbd splitter",
          data: null,
        };
      }

      // ==== KNOWLEDGE BASE SWITCHING LOGIC ====
      // 4. Handle knowledge base update based on isOnKnowledgeSource flag
      // 4.a. If isOnKnowledgeSource is false, remove from knowledge base
      if (!data.isOnKnowledgeSource) {
        // If isOnKnowledgeSource is false, remove from knowledge base
        await this.knowledgePort.deleteSplitter(
          id,
          dbConnWithVbdAndUser.vbd_splitter.name
        );
        data.isOnKnowledgeSource = false; // Ensure it's false
        data.knowledgeSourceId = ""; // Clear knowledgeSourceId
      }

      // 4.b. If isOnKnowledgeSource is true, delete existing and add in knowledge base
      if (data.isOnKnowledgeSource) {
        await this.knowledgePort.deleteSplitter(
          id,
          dbConnWithVbdAndUser.vbd_splitter.name
        );
        await this.knowledgePort.create({
          id: id || existingNlqQaGood.id,
          nlqQaGoodId: id || existingNlqQaGood.id,
          question: data.question || existingNlqQaGood.question,
          query: data.query || existingNlqQaGood.query,
          tablesColumns: data.tablesColumns || existingNlqQaGood.tablesColumns,
          namespace: dbConnWithVbdAndUser.vbd_splitter.name,
        });
        data.knowledgeSourceId =
          data.knowledgeSourceId || existingNlqQaGood.knowledgeSourceId;
        data.isOnKnowledgeSource = true; // Ensure it's true
      }

      // 5. Update NLQ QA Good entry
      data.isDelete = false; // Ensure isDelete remains false on update
      await this.nlqQaGoodRepository.update(id, data);

      // 6. Find updated NLQ QA Good
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

      // 7. Return success response
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
