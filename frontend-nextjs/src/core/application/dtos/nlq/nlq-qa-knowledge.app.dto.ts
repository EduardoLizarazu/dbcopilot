import { z } from "zod";

const nlqQaKnowledgeSchema = z.object({
  id: z.string().min(2),
  nlqQaGoodId: z.string().min(2),
  question: z.string().min(2),
  namespace: z.string().min(2),
  query: z.string().min(2),
  tablesColumns: z.array(z.string()).default([""]), // ["[TABLE].[COLUMN]"]
  values: z.array(z.number()).min(1).optional(), // Embedding vector
  score: z.number().min(0),
});

export const createNlqQaKnowledgeSchema = nlqQaKnowledgeSchema.omit({
  values: true,
  score: true,
});
export type TCreateNlqQaKnowledgeDto = z.infer<
  typeof createNlqQaKnowledgeSchema
>;

export const updateNlqQaKnowledgeSchema = createNlqQaKnowledgeSchema;

export type TUpdateNlqQaKnowledgeDto = z.infer<
  typeof updateNlqQaKnowledgeSchema
>;

export type TNlqQaKnowledgeInRequestDto = z.infer<typeof nlqQaKnowledgeSchema>;
export type TNlqQaKnowledgeOutRequestDto = z.infer<typeof nlqQaKnowledgeSchema>;
