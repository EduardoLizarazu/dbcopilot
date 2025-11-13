import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IDeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { IDeleteNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/delete-nlq-qa-good.step";
import { IReadNlqQaGoodByIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-id.step";

export interface IDeleteQaGoodUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

/**
 * Delete a QA good item by its ID.
 * 1. Validate the provided ID.
 * 2. Check if the item exists in the database.
 *   2.a If not found, throw an error.
 *   2.b If found, proceed to the next step.
 * 3. Check if dbConnectionId is present in the item.
 *   3.a If item has db connection.
 *   3.a.1 Then, retrieve the associated db connection with splitter name.
 *   3.a.2 Then, delete from the knowledge source.
 *   3.b If item does not have db connection, skip to step 5.
 * 4. Delete the item from the database.
 */

export class DeleteQaGoodUseCase implements IDeleteQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaGoodByIdStep: IReadNlqQaGoodByIdStep,
    private readonly readDbConnectionWithSplitterAndSchemaQueryStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly deleteOnKnowledgeBaseByIdStep: IDeleteOnKnowledgeBaseByIdStep,
    private readonly deleteNlqQaGoodStep: IDeleteNlqQaGoodStep
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate the provided ID
      // 2. Check if the item exists in the database
      const nlqQaGood = await this.readNlqQaGoodByIdStep.run(id);

      // 3. Check if dbConnectionId is present in the item.
      if (nlqQaGood?.dbConnectionId) {
        // 3.a If item has db connection.
        // 3.a.1 Then, retrieve the associated db connection with splitter name.
        const dbConnection =
          await this.readDbConnectionWithSplitterAndSchemaQueryStep.run({
            dbConnectionId: nlqQaGood.dbConnectionId,
          });

        // 3.a.2 Then, delete from the knowledge source.
        await this.deleteOnKnowledgeBaseByIdStep.run({
          id: nlqQaGood.id,
          splitterName: dbConnection.vbd_splitter.name,
        });
      }

      // 4. Delete the item from the database.
      await this.deleteNlqQaGoodStep.run(nlqQaGood.id);

      return {
        success: true,
        data: null,
        message: "QA good item deleted successfully.",
      };
    } catch (error) {
      this.logger.error("Error deleting QA good item:", error.message);
      return {
        success: false,
        data: null,
        message: "Failed to delete QA good item: " + error.message,
      };
    }
  }
}
