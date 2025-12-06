import { ILogger } from "../interfaces/ilog.app.inter";
import crypto from "crypto";

export interface ISimpleHashQuestionAndQueryHelp {
  help(data: { question: string; query: string }): Promise<string>;
}

export class SimpleHashQuestionAndQueryHelp
  implements ISimpleHashQuestionAndQueryHelp
{
  constructor(private readonly logger: ILogger) {}
  async help(data: { question: string; query: string }): Promise<string> {
    try {
      // Verify input data
      if (!data?.question || !data?.query) {
        this.logger.error(
          "[HashQuestionAndQueryHelp]: Missing question or query in input data."
        );
        throw new Error("Both question and query must be provided.");
      }

      // Normalize the question and query
      const normalizedQuestion = data.question
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      const normalizedQuery = data.query
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      const combinedString = `${normalizedQuestion}||${normalizedQuery}`;
      const hash = crypto
        .createHash("sha256")
        .update(combinedString)
        .digest("hex");
      return hash;
    } catch (error) {
      this.logger.error(
        "[HashQuestionAndQueryHelp]: ",
        error.message || "Unknown error"
      );
      throw new Error(
        error.message || "Failed to generate help for hash question and query."
      );
    }
  }
}
