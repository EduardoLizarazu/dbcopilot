import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
  TUpdateNlqQaGoodInRqDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { IAddToTheKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/add-to-knowledge-base.step";
import { IDeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { IUpdateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/update-nlq-qa-good.step";
import { IValidateUpdateNlqQaGoodInputDataStep } from "@/core/application/steps/nlq-qa-good/validate-update-nlq-qa-good-input-data.step";

export interface IUpdateNlqQaGoodUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaGoodDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

// ADD DELETE WHEN EXECUTION STATUS IS TO DELETE

/**
 * Use case for updating an existing NLQ QA Good entry:
 * 1. Validates the input data and ID.
 * 2. Ensures dbConnection exists with splitter.
 * 3. Handles knowledge base updates based on the isOnKnowledgeSource flag:
 *  3.a. If false, removes the entry from the knowledge base.
 *  3.b. If true, deletes any existing entry and adds the updated entry to the knowledge base.
 * 4. Updates the NLQ QA Good entry in the repository.
 * 5. Returns the updated NLQ QA Good entry or an error message if any step fails.
 */

export class UpdateNlqQaGoodUseCase implements IUpdateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validateUpdateNlqQaGoodInputDataStep: IValidateUpdateNlqQaGoodInputDataStep,
    private readonly ensureDbConnWithSplitterExistsStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly addToKnowledgeBaseStep: IAddToTheKnowledgeBaseStep,
    private readonly deleteOnKnowledgeBaseByIdStep: IDeleteOnKnowledgeBaseByIdStep,
    private readonly updateNlqQaGoodStep: IUpdateNlqQaGoodStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}
  async execute(
    id: string,
    data: TUpdateNlqQaGoodInRqDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Updating NLQ QA Good with ID: ${id}`,
        data
      );

      //   1. Validate input data and ID
      const validInputData =
        await this.validateUpdateNlqQaGoodInputDataStep.run({
          ...data,
          id,
        });

      // 2. Ensure dbConnection exists with splitter
      const dbConn = await this.ensureDbConnWithSplitterExistsStep.run({
        dbConnectionId: validInputData.dbConnectionId,
      });

      // 3. Handle knowledge base updates based on isOnKnowledgeSource flag
      if (validInputData.isOnKnowledgeSource === false) {
        // 3.a. If false, remove from knowledge base
        await this.deleteOnKnowledgeBaseByIdStep.run({
          id: validInputData.knowledgeSourceId || id,
          splitterName: dbConn.vbd_splitter.name,
        });
        this.logger.info(
          `[UpdateNlqQaGoodUseCase] Removed NLQ QA Good with ID: ${id} from knowledge base as isOnKnowledgeSource is false`
        );
      } else if (validInputData.isOnKnowledgeSource === true) {
        // 3.b. If true, delete existing and add updated to knowledge base
        await this.deleteOnKnowledgeBaseByIdStep.run({
          id: validInputData.knowledgeSourceId || id,
          splitterName: dbConn.vbd_splitter.name,
        });
        this.logger.info(
          `[UpdateNlqQaGoodUseCase] Deleted existing NLQ QA Good with ID: ${id} from knowledge base before re-adding`
        );
        await this.addToKnowledgeBaseStep.run({
          id: validInputData.id,
          question: validInputData.question,
          query: validInputData.query,
          nlqQaGoodId: validInputData.id,
          tablesColumns: validInputData.tablesColumns,
          namespace: dbConn.vbd_splitter.name,
        });
        this.logger.info(
          `[UpdateNlqQaGoodUseCase] Added updated NLQ QA Good with ID: ${id} to knowledge base`
        );
      }

      // Generate tablesColumns if not provided
      const schemaRepresentation = await this.genTableColumnsStep.run({
        query: validInputData.query,
      });

      // 4. Update the NLQ QA Good entry in the repository
      const { actorId, ...restData } = validInputData; // Exclude actorId from update
      const updatedEntry = await this.updateNlqQaGoodStep.run({
        ...restData,
        tablesColumns: schemaRepresentation.tablesColumns,
        updatedBy: validInputData.actorId,
      });
      this.logger.info(
        `[UpdateNlqQaGoodUseCase] Updated NLQ QA Good with ID: ${id}`,
        updatedEntry
      );

      // 5. Return the updated NLQ QA Good entry
      return {
        success: true,
        data: updatedEntry,
        message: "NLQ QA Good updated successfully",
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

      throw new Error(`${errorMessage}`);
    }
  }
}
