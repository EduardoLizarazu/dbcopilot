import { z } from "zod";

export const nlqQaFeedbackSchema = z.object({
  id: z.string(),
  nlqQaId: z.string(),
  isGood: z.boolean(),
  comment: z.string().max(8000),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
