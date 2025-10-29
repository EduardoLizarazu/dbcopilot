import { z } from "zod";
import { TNlqQaFeedbackOutRequestDto } from "./nlq-qa-feedback.app.dto";
import { TUserOutputRequestDto } from "../user.app.dto";
import { TNlqQaErrorOutRequestDto } from "./nlq-qa-error.app.dto";
import { TDbConnectionOutRequestDto } from "../dbconnection.dto";
import { TNlqQaGoodOutRequestDto } from "./nlq-qa-good.app.dto";

export const nlqQaSchema = z.object({
  id: z.string(),
  question: z.string().min(2),
  query: z.string().min(2),
  isGood: z.boolean().default(true),
  timeQuestion: z.date().default(new Date()),
  timeQuery: z.date().default(new Date()),
  userDeleted: z.boolean().default(false),

  feedbackId: z.string().default(""),
  knowledgeSourceUsedId: z.array(z.string()),
  nlqErrorId: z.string().default(""),
  nlqQaGoodId: z.string().default(""),
  dbConnectionId: z.string().min(2),

  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const nlqQaHistoryOutSchema = nlqQaSchema;
export type TNlqQaHistoryOutDto = z.infer<typeof nlqQaHistoryOutSchema>;

export const createNlqQaSchema = nlqQaSchema.omit({
  id: true,
});

export type TCreateNlqQaDto = z.infer<typeof createNlqQaSchema>;

export const updateNlqQaSchema = nlqQaSchema.omit({
  createdAt: true,
  createdBy: true,
});

export const updateNlqGoodSchema = z.object({
  id: z.string().min(2),
  isGood: z.boolean(),
  nlqQaGoodId: z.string().min(2),
});

export type TUpdateNlqGoodDto = z.infer<typeof updateNlqGoodSchema>;

export type TUpdateNlqQaDto = z.infer<typeof updateNlqQaSchema>;

export const nlqQaInRequestSchema = nlqQaSchema
  .pick({
    question: true,
    dbConnectionId: true,
  })
  .extend({
    actorId: z.string().min(2),
  });

export type TNlqQaInRequestDto = z.infer<typeof nlqQaInRequestSchema>;

export const nlqQaOutRequestSchema = nlqQaSchema.extend({
  // Add any additional fields for output if necessary results?: Record<string, unknown>[];
  results: z.array(z.record(z.unknown())).optional(),
});

export type TNlqQaOutRequestDto = z.infer<typeof nlqQaOutRequestSchema>;

export type TNlqQaWitFeedbackOutRequestDto = TNlqQaOutRequestDto & {
  feedback: TNlqQaFeedbackOutRequestDto | null;
  user: TUserOutputRequestDto | null;
  error: TNlqQaErrorOutRequestDto | null;
  dbConnection: TDbConnectionOutRequestDto | null;
  nlqQaGoodUsed: TNlqQaGoodOutRequestDto[] | null;
};
