import { z } from "zod";
import { TNlqQaFeedbackOutRequestDto } from "./nlq-qa-feedback.app.dto";
import { TUserOutputRequestDto } from "../user.app.dto";
import { TNlqQaErrorOutRequestDto } from "./nlq-qa-error.app.dto";

export const nlqQaSchema = z.object({
  id: z.string(),
  question: z.string().min(2),
  query: z.string().min(2),
  isGood: z.boolean().default(true),
  timeQuestion: z.date(),
  timeQuery: z.date(),
  userDeleted: z.boolean().default(false),

  feedbackId: z.string(),
  knowledgeSourceUsedId: z.array(z.string()),
  createdBy: z.string(),
  nlqErrorId: z.string(),

  updatedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createNlqQaSchema = nlqQaSchema.omit({
  id: true,
});

export type TCreateNlqQaDto = z.infer<typeof createNlqQaSchema>;

export const updateNlqQaSchema = nlqQaSchema.omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateNlqQaDto = z.infer<typeof updateNlqQaSchema>;

export const nlqQaInRequestSchema = nlqQaSchema.pick({
  question: true,
  createdBy: true,
});

export type TNlqQaInRequestDto = z.infer<typeof nlqQaInRequestSchema>;

export const nlqQaOutRequestSchema = nlqQaSchema.extend({
  // Add any additional fields for output if necessary results?: Record<string, unknown>[];
  results: z.array(z.record(z.unknown())).optional(),
});

export type TNlqQaOutRequestDto = z.infer<typeof nlqQaOutRequestSchema>;

export type TNlqQaWitFeedbackOutRequestDto = TNlqQaOutRequestDto & {
  feedback: TNlqQaFeedbackOutRequestDto | null;
  user: TUserOutputRequestDto;
  error: TNlqQaErrorOutRequestDto | null;
};
