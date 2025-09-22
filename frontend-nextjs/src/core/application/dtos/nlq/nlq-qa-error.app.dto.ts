import { z } from "zod";

export const nlqQaErrorSchema = z.object({
  id: z.string(),
  nlqQaId: z.string(),
  errorMessage: z.string(),
  query: z.string().optional(),
  stack: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
});

export const createNlqQaErrorSchema = nlqQaErrorSchema.omit({ id: true });
export type TCreateNlqQaErrorDto = z.infer<typeof createNlqQaErrorSchema>;

export const updateNlqQaErrorSchema = nlqQaErrorSchema.omit({
  createdAt: true,
  createdBy: true,
});
export type TUpdateNlqQaErrorDto = z.infer<typeof updateNlqQaErrorSchema>;

export type TNlqQaErrorInRequestDto = z.infer<typeof nlqQaErrorSchema>;
export type TNlqQaErrorOutRequestDto = z.infer<typeof nlqQaErrorSchema>;
