import { z } from "zod";
import { schemaCtxDiffSchema, schemaCtxSchema } from "./schemaCtx.dto";
import { EnumDecision } from "./nlq/nlq-qa-feedback.app.dto";

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

export const SGenJudgePositiveFbDto = z.object({
  prevQuestion: z.string().min(1),
  prevQuery: z.string().min(1),
  currentQuestion: z.string().min(1),
  currentQuery: z.string().min(1),
  schemaCtx: z.array(schemaCtxSchema).default([]),
});
export type TGenJudgePositiveFbDto = z.infer<typeof SGenJudgePositiveFbDto>;

export const SGenJudgePositiveVbOutDto = z.object({
  decision: z.nativeEnum(EnumDecision),
  query: z.string().default(""),
  question: z.string().default(""),
});
export type TGenJudgePositiveVbOutDto = z.infer<
  typeof SGenJudgePositiveVbOutDto
>;
