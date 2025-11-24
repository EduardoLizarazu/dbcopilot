import { z } from "zod";
import { schemaCtxDiffSchema, schemaCtxSchema } from "./schemaCtx.dto";

export enum ESchemaChangeStatus {
  DELETE = "DELETE",
  UPDATE = "UPDATE",
}

export const genNewQuestionQueryFromOld = z.object({
  extraMessage: z.string().optional().default(""),
  previousQuestion: z.string().min(1),
  previousQuery: z.string().min(1),
  schemaCtxDiff: z.array(schemaCtxDiffSchema),
}); // only if has change (update)

export type TGenNewQuestionQueryFromOldDto = z.infer<
  typeof genNewQuestionQueryFromOld
>;

export const genQueryCorrectionDto = z.object({
  extractMessage: z.string().optional().default(""),
  dbConnectionId: z.string().min(1),
  nlqGoodUsed: z
    .array(
      z.object({
        questionUsed: z.string().min(1),
        queryUsed: z.string().min(1),
        tableColumns: z.array(z.string()).optional().default([]),
      })
    )
    .optional()
    .default([]),
  prevQuestion: z.string().min(1),
  wrongQuery: z.string().min(1),
  hint: z.string().min(1), // error or feedback
  schemaCtx: z.array(schemaCtxSchema).default([]),
});

export type TGenQueryCorrectionDto = z.infer<typeof genQueryCorrectionDto>;
