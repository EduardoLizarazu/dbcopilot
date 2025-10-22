import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IDeleteDbConnStep } from "../../steps/dbconn/delete-dbconn.step";
import { IReadDbConnByIdStep } from "../../steps/dbconn/read-dbconn-by-id.step";
import { IDeleteOnKnowledgeBaseByIdStep } from "../../steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { IReadNlqQaGoodByDbConnIdStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";
import { IRemoveDbConnOnNlqQaGoodByIdStep } from "../../steps/nlq-qa-good/remove-dbconn-on-nlq-qa-good.step";
import { IDeleteConnSchemaStep } from "../../steps/schema/delete-conn-schema.step";
import { IReadVbdSplitterByIdStep } from "../../steps/vbd-splitter/read-vbd-splitter-by-id.step";

export interface IDeleteDbConnectionUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

/**
 * Delete db connection use case:
 * 1. Validate input id
 * 2. Check if the db connection exists
 * 2.1 With the db connection splitter id, get the splitter.
 * 3. Get all the nlq qa good entry associated with the db connection id
 * 4. Filter only the ones with isOnKnowledgeSource true
 * 5.1 If knowledge source is true, delete on knowledge base by id and splitter name
 * 5.2 If knowledge source is false, skip
 * 6. Update all the nlq qa good entry to isOnKnowledgeSource false and knowledgeSourceId to empty string and connectionId to empty string, by iteration
 * 7. Delete db connection
 * 8. Delete the connection from the schema context graph
 * 9. Return response
 */

export class DeleteDbConnectionUseCase implements IDeleteDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly checkIfDbConnExists: IReadDbConnByIdStep,
    private readonly readSplitterByIdStep: IReadVbdSplitterByIdStep,
    private readonly readNlqQaGoodByDbConnId: IReadNlqQaGoodByDbConnIdStep,
    private readonly deleteOnKnowledgeBaseById: IDeleteOnKnowledgeBaseByIdStep,
    private readonly removeDbConnOnNlqQaGoodById: IRemoveDbConnOnNlqQaGoodByIdStep,
    private readonly deleteDbConnStep: IDeleteDbConnStep,
    private readonly deleteConnOnSchemaStep: IDeleteConnSchemaStep
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      this.logger.info(
        `[DeleteDbConnectionUseCase] Deleting DB connection with id: ${id}`
      );
      // 1. Validate input id
      // 2. Check if the DB connection exists
      const dbConn = await this.checkIfDbConnExists.run({ dbConnId: id });

      // 2.1 With the db connection splitter id, get the splitter.
      const splitter = await this.readSplitterByIdStep.run({
        idSplitter: dbConn.id_vbd_splitter,
      });

      // 3. Get all the nlq qa good entry associated with the db connection id
      const nlqQaGoods = await this.readNlqQaGoodByDbConnId.run({
        dbConnId: id,
      });

      // 4. Filter only the ones with isOnKnowledgeSource true
      const nlqQaGoodsToDelete = nlqQaGoods.filter(
        (nlq) => nlq?.isOnKnowledgeSource === true
      );

      // 5.1 If knowledge source is true, delete on knowledge base by id and splitter name
      // 5.2 If knowledge source is false, skip
      for (const nlq of nlqQaGoodsToDelete) {
        await this.deleteOnKnowledgeBaseById.run({
          id: nlq.id,
          splitterName: splitter.name,
        });
      }

      // 6. Update all the nlq qa good entry to isOnKnowledgeSource false and knowledgeSourceId to empty string and connectionId to empty string, by iteration
      for (const nlq of nlqQaGoods) {
        await this.removeDbConnOnNlqQaGoodById.run({
          nlqQaGoodId: nlq.id,
        });
      }

      // 7. Delete db connection
      await this.deleteDbConnStep.run(id);

      // 8. Delete the connection from the schema context graph
      await this.deleteConnOnSchemaStep.run(id);

      // 9. Return response
      this.logger.info(
        `[DeleteDbConnectionUseCase] Successfully deleted DB connection with id: ${id}`
      );
      return {
        success: true,
        message: "DB connection deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteDbConnectionUseCase] Error deleting DB connection with id ${id}: ${error.message}`
      );
      return {
        success: false,
        message: error.message || "Error deleting DB connection",
        data: null,
      };
    }
  }
}
