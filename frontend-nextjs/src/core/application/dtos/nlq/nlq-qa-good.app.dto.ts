import { z } from "zod";

export const nlqQaGoodSchema = z.object({
  id: z.string(),
  question: z.string().min(2),
  query: z.string().min(2),
  knowledgeSourceId: z.string().min(2), // VDB
  isOnKnowledgeSource: z.boolean(),
  nlqQaGoodDetailsId: z.string().min(2), // FK to nlqQaGoodDetails

  questionBy: z.string().min(2),
  createdBy: z.string().min(2),
  updatedBy: z.string().min(2),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createNlqQaGoodSchema = nlqQaGoodSchema.omit({ id: true });
export type TCreateNlqQaGoodDto = z.infer<typeof createNlqQaGoodSchema>;

export const updateNlqQaGoodSchema = nlqQaGoodSchema.omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateNlqQaGoodDto = z.infer<typeof updateNlqQaGoodSchema>;

export type TNlqQaGoodInRequestDto = z.infer<typeof nlqQaGoodSchema>;

export type TNlqQaGoodOutRequestDto = z.infer<typeof nlqQaGoodSchema>;
