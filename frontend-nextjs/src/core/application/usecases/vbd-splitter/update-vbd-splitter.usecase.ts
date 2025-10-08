import { TResponseDto } from "../../dtos/utils/response.app.dto";
import {
  TVbdInRequestDto,
  TVbdOutRequestDto,
  updateVbdSchema,
  vbdInRequestSchema,
} from "../../dtos/vbd.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";
import { IVbdSplitterRepository } from "../../interfaces/vbd-splitter.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

/**
 * UseCase for updating a VBD Splitter:
 * 1. Validate input data
 * 2. Check if VBD Splitter exists
 * 3. Check if the name is the same as before
 * 4. Check if the name is unique
 * 5. Prepare data for update
 * 6. Validate update DTO
 * 7. Update namespace in knowledge source
 * 8. Call repository to update VBD splitter
 * 9. Retrieve the updated splitter details
 * 10. Return success response
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
    private readonly vbdSplitterRepo: IVbdSplitterRepository,
    private readonly nlqGoodRepo: INlqQaGoodRepository,
    private readonly knowledgePort: INlqQaKnowledgePort
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
      const validData = await vbdInRequestSchema.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[UpdateVbdSplitterUseCase] Invalid input data: ${JSON.stringify(validData.error)}`,
          data
        );
        return {
          success: false,
          message: "Invalid input data",
          data: null,
        };
      }
      // 2. Check if VBD Splitter exists
      const existingVbd = await this.vbdSplitterRepo.findById(id);
      if (!existingVbd) {
        this.logger.error(
          `[UpdateVbdSplitterUseCase] VBD Splitter not found with id: ${id}`
        );
        return {
          success: false,
          message: "VBD Splitter not found",
          data: null,
        };
      }

      this.logger.info(
        `[UpdateVbdSplitterUseCase] Existing VBD Splitter found: ${existingVbd.name}`,
        existingVbd
      );

      //   3. Check if the name is the same as before
      if (existingVbd.name === data.name) {
        this.logger.info(
          `[UpdateVbdSplitterUseCase] VBD Splitter name is the same as before: ${data.name}`
        );
        return {
          success: false,
          message: "VBD Splitter name is the same as before",
          data: null,
        };
      }

      //   4. Check if the name is unique
      const isNameUnique = await this.vbdSplitterRepo.findByName(data.name);
      if (isNameUnique && isNameUnique.name === data.name) {
        this.logger.error(
          `[UpdateVbdSplitterUseCase] VBD Splitter name must be unique: ${data.name} and ${existingVbd.name}`
        );
        return {
          success: false,
          message: "VBD Splitter name must be unique",
          data: null,
        };
      }

      // 5. Transform to valid dto
      const updateDto = {
        id: data.id,
        name: data.name.trim().toLowerCase(),
        updatedAt: new Date(),
        updatedBy: data.actorId,
      };
      // 6. Check valid data to create
      const updateValidDate = await updateVbdSchema.safeParseAsync(updateDto);
      if (!updateValidDate.success) {
        this.logger.error(
          `[UpdateVbdSplitterUseCase] Invalid VBD Splitter update data: ${JSON.stringify(updateValidDate.error)}`,
          updateDto
        );
        return {
          success: false,
          message:
            "Invalid VBD Splitter update data " +
            JSON.stringify(updateValidDate.error),
          data: null,
        };
      }

      //   === UPDATE NAMESPACE IN KNOWLEDGE SOURCE ===

      // 8. Create new knowledge entries under the new namespace
      const nlqGoods = await this.nlqGoodRepo.findAllWithUserAndConn();
      const nlqGoodsToUpdate = nlqGoods.filter(
        (nlq) =>
          nlq?.dbConnection &&
          nlq?.dbConnection?.id_vbd_splitter &&
          nlq?.dbConnection?.id_vbd_splitter === existingVbd.id &&
          nlq?.isOnKnowledgeSource === true
      );
      this.logger.info(
        `[UpdateVbdSplitterUseCase] Found ${nlqGoodsToUpdate.length} NLQ QA Good entries to update for VBD Splitter ID: ${existingVbd.id}`,
        nlqGoodsToUpdate
      );
      for (const nlq of nlqGoodsToUpdate) {
        try {
          await this.knowledgePort.create({
            id: nlq.id,
            nlqQaGoodId: nlq.id,
            question: nlq.question,
            query: nlq.query,
            tablesColumns: nlq.tablesColumns,
            namespace: data.name,
          });
        } catch (error) {
          this.logger.error(
            `[UpdateVbdSplitterUseCase] Error re-adding NLQ QA Good to knowledge source with ID: ${nlq.id}`,
            error instanceof Error ? error.message : error
          );
        }
      }

      //   === END UPDATE NAMESPACE IN KNOWLEDGE SOURCE ===

      // 8. Update VBD Splitter
      await this.vbdSplitterRepo.update(id, updateDto);

      // 9. Ensure knowledge namespace exists
      const updatedVbd = await this.vbdSplitterRepo.findById(id);
      if (!updatedVbd) {
        this.logger.error(
          `[UpdateVbdSplitterUseCase] Updated VBD Splitter not found with id: ${id}`
        );
        return {
          success: false,
          message: "Updated VBD Splitter not found",
          data: null,
        };
      }
      // 7. Delete all knowledge entries under the old namespace
      await this.knowledgePort.deleteAllBySplitter(existingVbd.name);

      //   10. Return success response
      this.logger.info(
        `[UpdateVbdSplitterUseCase] VBD Splitter updated successfully`,
        updatedVbd
      );
      return {
        success: true,
        message: "VBD Splitter updated successfully",
        data: updatedVbd,
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
