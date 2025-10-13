import {
  TDbConnectionOutRequestDto,
  TUpdateDbConnInReqDto,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IUpdateDbConnStep } from "../../steps/dbconn/update-dbconn.step";
import { IValidateInputUpdateDbConnStep } from "../../steps/dbconn/validate-input-update-dbconn.step";
import { ITransferSplitterToNewOnKnowledgeBaseStep } from "../../steps/knowledgeBased/transfer-splitter-to-new-on-knowledge-base.step";
import { IReadNlqQaGoodByDbConnIdStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";
import { IReadVbdSplitterByIdStep } from "../../steps/vbd-splitter/read-vbd-splitter-by-id.step";

export interface IUpdateDbConnectionUseCase {
  execute(
    id: string,
    data: TUpdateDbConnInReqDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>>;
}

/**
 * Update db connection use case:
 * 1. Validate input data
 * 2. Get the old db connection by id.
 * 3. Get the old splitter by id.
 * 4. Get the new splitter by id
 * 5. Get all the nql qa good entries associated with the connection id.
 * 6. Filter only the ones that have isOnKnowledgeSource true.
 * 7. Iterate over the nlq qa good entries and with the knowledgeSourceId copy the new splitter name and remove from the previous splitter name.
 * 8. Update the db connection
 * 9. Return response
 */

export class UpdateDbConnectionUseCase implements IUpdateDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validateUpdateInputDbConnStep: IValidateInputUpdateDbConnStep,
    private readonly readDbConnById: IReadDbConnByIdStep,
    private readonly readSplitterByIdStep: IReadVbdSplitterByIdStep,
    private readonly readNlqQaGoodByDbConnIdStep: IReadNlqQaGoodByDbConnIdStep,
    private readonly updateDbConnStep: IUpdateDbConnStep,
    private readonly transferSplitterToNewOnKnowledgeBaseStep: ITransferSplitterToNewOnKnowledgeBaseStep
  ) {}

  async execute(
    id: string,
    data: TUpdateDbConnInReqDto // new splitter id
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateDbConnectionUseCase] Updating DB connection with id: ${id} and data:`,
        data
      );
      // 1. Validate input data
      const vData = await this.validateUpdateInputDbConnStep.run(data);

      // 2. Get the old db connection by id.
      const oldDbConn = await this.readDbConnById.run({
        dbConnId: id,
      });

      // 3. Get the old splitter by id.
      const oldSplitter = await this.readSplitterByIdStep.run({
        idSplitter: oldDbConn.id_vbd_splitter,
      });

      // 4. Get the new splitter by id
      const newSplitter = await this.readSplitterByIdStep.run({
        idSplitter: vData.id_vbd_splitter,
      });

      // 5. Get all the nql qa good entries associated with the connection id.
      const nlqQaGoods = await this.readNlqQaGoodByDbConnIdStep.run({
        dbConnId: vData.id,
      });

      // 6. Filter only the ones that have isOnKnowledgeSource true.
      const nlqQaGoodsOnKnowledgeSource = nlqQaGoods.filter(
        (nlq) => nlq.isOnKnowledgeSource === true && nlq.knowledgeSourceId
      );

      // 7. Iterate over the nlq qa good entries and with the knowledgeSourceId copy from Knowledge Source splitter to the new splitter, removing the previous splitter name.
      for (const nlq of nlqQaGoodsOnKnowledgeSource) {
        this.transferSplitterToNewOnKnowledgeBaseStep.run({
          id: nlq.knowledgeSourceId!,
          oldSplitterName: oldSplitter.name,
          newSplitterName: newSplitter.name,
        });
      }

      // 8. Update the db connection
      const updateDto = {
        ...vData,
        id,
        updatedBy: vData.actorId,
      };
      delete updateDto.actorId;

      const updatedDbConn = await this.updateDbConnStep.run(updateDto);

      // 9. Return response
      return {
        success: true,
        message: "DB connection updated successfully",
        data: updatedDbConn,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateDbConnectionUseCase] Error updating DB connection: ${error.message}`
      );
      return {
        data: null,
        message: error.message || "Error updating DB connection",
        success: false,
      };
    }
  }
}
