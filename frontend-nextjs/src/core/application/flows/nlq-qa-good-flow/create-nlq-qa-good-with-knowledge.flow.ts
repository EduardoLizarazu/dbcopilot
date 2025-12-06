import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ISimpleHashQueryHelp } from "../../helps/simple-hash-query.help";
import { ISimpleHashQuestionAndQueryHelp } from "../../helps/simple-hash-question-and-query.help";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "../../steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IGenTableColumnsStep } from "../../steps/genTepology/gen-table-columns.step";
import { IAddToTheKnowledgeBaseStep } from "../../steps/knowledgeBased/add-to-knowledge-base.step";
import { ICreateNlqQaGoodStep } from "../../steps/nlq-qa-good/create-nlq-qa-good.step";
import { IUpdateNlqQaGoodKnowledgeStep } from "../../steps/nlq-qa-good/update-nlq-qa-good-knowledge.step";
import { IValidateCreateNlqQaGoodInputDataStep } from "../../steps/nlq-qa-good/validate-create-nlq-qa-good-input-data.step";
import { IUpdateNlqQaGoodFieldFromGoodStep } from "../../steps/nlq-qa/update-nlq-qa-good-field-from-good.step";

export interface ICreateNlqQaGoodWithKnowledgeBasedFlow {
  flow(data: TCreateNlqQaGoodDto): Promise<TNlqQaGoodDto>;
}

export class CreateNlqQaGoodWithKnowledgeBasedFlow
  implements ICreateNlqQaGoodWithKnowledgeBasedFlow
{
  constructor(
    private readonly logger: ILogger,
    private readonly questionQueryHashHelp: ISimpleHashQuestionAndQueryHelp,
    private readonly queryHashHelp: ISimpleHashQueryHelp,
    private readonly readDbConnWithSplitterStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly createNlqQaGoodStep: ICreateNlqQaGoodStep,
    private readonly addToKnowledgeSource: IAddToTheKnowledgeBaseStep,
    private readonly updateNlqQaGoodOnKnowledgeStep: IUpdateNlqQaGoodKnowledgeStep,
    private readonly updateNlqQaIfOriginIdStep: IUpdateNlqQaGoodFieldFromGoodStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}

  async flow(data: TCreateNlqQaGoodDto): Promise<TNlqQaGoodDto> {
    try {
      this.logger.info(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Starting flow with data: `,
        data
      );
      const dbConnectionWithSplitter =
        await this.readDbConnWithSplitterStep.run({
          dbConnectionId: data.dbConnectionId,
        });

      // 1. Generate hashes
      const questionQueryHashRes = await this.questionQueryHashHelp.help({
        question: data.question,
        query: data.query,
      });
      const queryHashRes = await this.queryHashHelp.help({
        query: data.query,
      });

      // 2. Generate tablesColumns if not provided
      const schemaRepresentation = await this.genTableColumnsStep.run({
        query: data.query,
      });

      // 3. Create NLQ QA Good
      const nlqQaGood = await this.createNlqQaGoodStep.run({
        ...data,
        questionBy: data.questionBy || "",
        originId: data.originId || "",
        questionQueryHash: questionQueryHashRes,
        queryHash: queryHashRes.queryHash,
        tablesColumns: schemaRepresentation.tablesColumns,
      });

      let out = nlqQaGood;
      if (nlqQaGood.isOnKnowledgeSource) {
        // 4. Create knowledge source
        const knowledgeSourceId = await this.addToKnowledgeSource.run({
          question: nlqQaGood.question,
          query: nlqQaGood.query,
          namespace: dbConnectionWithSplitter?.vbd_splitter?.name || "",
          nlqQaGoodId: nlqQaGood.id,
          tablesColumns: nlqQaGood.tablesColumns,
          queryHash: nlqQaGood.queryHash,
          questionQueryHash: nlqQaGood.questionQueryHash,
        });

        // 5. Update NLQ QA Good with knowledge source info
        out = await this.updateNlqQaGoodOnKnowledgeStep.run({
          id: nlqQaGood.id,
          knowledgeSourceId: knowledgeSourceId.id,
        });
      }

      // 6. If originId is provided, update the NLQ QA entry to link to this good feedback
      if (data.originId && data.originId.trim() !== "") {
        await this.updateNlqQaIfOriginIdStep.run({
          id: data.originId,
          isGood: true,
          nlqQaGoodId: nlqQaGood.id,
        });
      }

      this.logger.info(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Flow completed successfully for NLQ QA Good ID: ${nlqQaGood.id}`
      );
      return out;
    } catch (error) {
      this.logger.error(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Error executing flow: `,
        error.message
      );
      throw new Error(error.message || "Error executing flow");
    }
  }
}
