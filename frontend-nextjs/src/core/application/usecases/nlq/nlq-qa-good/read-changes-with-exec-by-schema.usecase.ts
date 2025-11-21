import { TDbConnectionOutRequestDto } from "@/core/application/dtos/dbconnection.dto";
import {
  nlqQaGoodWithExecution,
  NlqQaGoodWithExecutionStatus,
  TNlqQaGoodOutRequestDto,
  TNlqQaGoodWithExecutionDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadDbConnByIdStep } from "@/core/application/steps/dbconn/read-dbconn-by-id.step";
import { IExecuteQueryStep } from "@/core/application/steps/infoBased/execute-query.step";
import { IReadNlqQaGoodByDbConnIdStep } from "@/core/application/steps/nlq-qa-good/read-nlq-qa-good-by-dbconn-id.step";

export interface IReadChangesWithExecBySchemaUseCase {
  execute(data: {
    dbConnectionIds: string[];
  }): Promise<TResponseDto<TNlqQaGoodWithExecutionDto[]>>;
}

export class ReadChangesWithExecBySchemaUseCase
  implements IReadChangesWithExecBySchemaUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readDbConnByIdStep: IReadDbConnByIdStep,
    private readonly readNlqQaGoodByDbConnIdStep: IReadNlqQaGoodByDbConnIdStep,
    private readonly executeQueryStep: IExecuteQueryStep
  ) {}

  async execute(data: {
    dbConnectionIds: string[];
  }): Promise<TResponseDto<TNlqQaGoodWithExecutionDto[]>> {
    try {
      this.logger.info(
        `[ReadChangesWithExecBySchemaUseCase] Data received for execution: `,
        data
      );
      // Read all by connections ids
      let allNlqQaGoods: TNlqQaGoodOutRequestDto[] = [];
      for (const dbConnId of data.dbConnectionIds) {
        const nlqQaGoods = await this.readNlqQaGoodByDbConnIdStep.run({
          dbConnId,
        });
        allNlqQaGoods = allNlqQaGoods.concat(nlqQaGoods);
      }

      // Get the connection fields by ids
      let allDbConnections: TDbConnectionOutRequestDto[] = [];
      for (const dbConnId of data.dbConnectionIds) {
        const dbConn = await this.readDbConnByIdStep.run({
          dbConnId: dbConnId,
        });
        allDbConnections.push(dbConn);
      }

      const allNlqQaGoodsWithExecution: TNlqQaGoodWithExecutionDto[] = [];
      // For each, execute the query with the correspond connection
      // and add the execution status
      // FAILED = 0, OK = 1, NOTHING = 2,
      for (const nlqQaGood of allNlqQaGoods) {
        const correspondingDbConn = allDbConnections.find(
          (conn) => conn.id === nlqQaGood.dbConnectionId
        );
        if (!correspondingDbConn) {
          throw new Error(
            `No DB Connection found for ID: ${nlqQaGood.dbConnectionId}`
          );
        }
        try {
          const res = await this.executeQueryStep.run({
            query: nlqQaGood.query,
            ...correspondingDbConn,
          });
          if (res?.data?.length === 0) {
            allNlqQaGoodsWithExecution.push({
              ...nlqQaGood,
              executionStatus: NlqQaGoodWithExecutionStatus.NOTHING, // NOTHING
            });
            continue;
          }

          allNlqQaGoodsWithExecution.push({
            ...nlqQaGood,
            executionStatus: NlqQaGoodWithExecutionStatus.OK, // OK
          });
        } catch (error) {
          this.logger.error(
            `[ReadChangesWithExecBySchemaUseCase] Query execution failed for NLQ QA Good ID: ${nlqQaGood.id}, Error: ${error.message}`
          );
          allNlqQaGoodsWithExecution.push({
            ...nlqQaGood,
            executionStatus: NlqQaGoodWithExecutionStatus.FAILED, // FAILED
          });
        }
      }

      const vAllNlqQaGoodsWithExecution = await nlqQaGoodWithExecution
        .array()
        .safeParseAsync(allNlqQaGoodsWithExecution);

      if (!vAllNlqQaGoodsWithExecution.success) {
        this.logger.error(
          `[ReadChangesWithExecBySchemaUseCase] Validation failed:`,
          vAllNlqQaGoodsWithExecution.error
        );
        throw new Error("Validation failed for NLQ QA Goods with execution");
      }

      return {
        success: true,
        message: "Successfully retrieved NLQ QA Goods",
        data: vAllNlqQaGoodsWithExecution.data,
      };
    } catch (error) {
      this.logger.error(
        `[ReadChangesWithExecBySchemaUseCase] Error executing use case:`,
        error.message
      );
      return {
        success: false,
        message:
          error.message || "Error executing ReadChangesWithExecBySchemaUseCase",
        data: null,
      };
    }
  }
}
