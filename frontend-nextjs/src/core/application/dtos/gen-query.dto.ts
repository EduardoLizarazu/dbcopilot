import { z } from "zod";
import { schemaCtxDiffSchema } from "./schemaCtx.dto";
export enum ESchemaChangeStatus {
  DELETE = "DELETE",
  UPDATE = "UPDATE",
}

export const genNewQuestionQueryFromOld = z.object({
  previousQuestion: z.string().min(1),
  previousQuery: z.string().min(1),
  schemaCtxDiff: z.array(schemaCtxDiffSchema),
}); // only if has change (update)

export type TGenNewQuestionQueryFromOldDto = z.infer<
  typeof genNewQuestionQueryFromOld
>;
