import { TDbConnectionOutRequestDto } from "../../dtos/dbconnection.dto";
import { IDbConnectionRepository } from "../../interfaces/dbconnection.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadAllDbConnBySplitterIdStep {
  run(data: {
    vbdSplitterIdrId: string;
  }): Promise<TDbConnectionOutRequestDto[]>;
}

export class ReadAllDbConnBySplitterIdStep
  implements IReadAllDbConnBySplitterIdStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly dbConnectionRepo: IDbConnectionRepository // Assume this repository is implemented elsewhere
  ) {}

  async run(data: {
    vbdSplitterIdrId: string;
  }): Promise<TDbConnectionOutRequestDto[]> {
    try {
      this.logger.info(
        `[ReadAllDbConnBySplitterIdStep] Reading DB Connections by VBD Splitter ID: ${data.vbdSplitterIdrId}`
      );

      //   Validate input
      if (!data.vbdSplitterIdrId || data.vbdSplitterIdrId.trim() === "") {
        this.logger.error(
          "[ReadAllDbConnBySplitterIdStep] Invalid VBD Splitter ID",
          data
        );
        throw new Error("Invalid VBD Splitter ID");
      }

      const dbConnections = await this.dbConnectionRepo.findAllByVbdSplitterId({
        vbdSplitterIdrId: data.vbdSplitterIdrId,
      });
      return dbConnections;
    } catch (error) {
      this.logger.error(
        `[ReadAllDbConnBySplitterIdStep] Error reading DB Connections by VBD Splitter ID: ${error.message}`,
        data
      );
      throw new Error(
        error.message || "Error reading DB Connections by VBD Splitter ID"
      );
    }
  }
}
