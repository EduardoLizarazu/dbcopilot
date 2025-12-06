import { z } from "zod";

export const nlqQaFeedbackSchema = z.object({
  id: z.string(),
  nlqQaId: z.string(),
  isGood: z.boolean(),
  comment: z.string().max(8000),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createNlqQaFeedbackSchema = nlqQaFeedbackSchema.omit({ id: true });
export type TCreateNlqQaFeedbackDto = z.infer<typeof createNlqQaFeedbackSchema>;

export const updateNlqQaFeedbackSchema = nlqQaFeedbackSchema.omit({
  createdAt: true,
  createdBy: true,
});
export type TUpdateNlqQaFeedbackDto = z.infer<typeof updateNlqQaFeedbackSchema>;

export type TNlqQaFeedbackInRequestDto = z.infer<typeof nlqQaFeedbackSchema>;
export type TNlqQaFeedbackOutRequestDto = z.infer<typeof nlqQaFeedbackSchema>;

export const nlqQaFeedbackInOrqDto = nlqQaFeedbackSchema
  .pick({
    nlqQaId: true,
  })
  .extend({
    userId: z.string(),
    feedbackId: z.string().optional(),
    isGood: z.boolean().optional(),
    comment: z.string().max(8000).optional(),
  });
export type TNlqQaFeedbackInOrqDto = z.infer<typeof nlqQaFeedbackInOrqDto>;

export enum EnumDecision {
  REPLACE = 0,
  KEEP_BOTH = 1,
  DISCARD_NEW = 2,
  ADD_AS_NEW = 3,
  COMBINED = 4,
}

export const SDecision = z.object({
  decision: z.nativeEnum(EnumDecision),
  question: z.string().optional().default(""),
  query: z.string().optional().default(""),
});

export type TDecision = z.infer<typeof SDecision>;
