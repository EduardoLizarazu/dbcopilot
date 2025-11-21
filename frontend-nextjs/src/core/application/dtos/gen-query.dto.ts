import { z } from "zod";
import { schemaCtxSchema } from "./schemaCtx.dto";
export enum ESchemaChangeStatus {
  DELETE = "DELETE",
  UPDATE = "UPDATE",
}

export const genNewQuestionQueryFromOld = z.object({
  previousQuestion: z.string().min(1),
  previousQuery: z.string().min(1),
  schemaChange: z.object({
    status: z.enum([ESchemaChangeStatus.DELETE, ESchemaChangeStatus.UPDATE]),
    new: z.string().optional(), // delete schema in string format
    old: z.string().optional(),
  }),
  schemaCtx: z.array(schemaCtxSchema).optional(),
}); // only if has change (update)

export type TGenNewQuestionQueryFromOldDto = z.infer<
  typeof genNewQuestionQueryFromOld
>;
