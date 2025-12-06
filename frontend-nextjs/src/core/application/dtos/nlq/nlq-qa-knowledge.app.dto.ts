import { z } from "zod";

const nlqQaKnowledgeSchema = z.object({
  id: z.string().min(2),
  nlqQaGoodId: z.string().min(2),
  question: z.string().min(2),
  namespace: z.string().min(2),
  query: z.string().min(2),
  tablesColumns: z.array(z.string()).default([""]), // ["[TABLE].[COLUMN]"]
  questionQueryHash: z.string().optional().default(""),
  queryHash: z.string().optional().default(""),
  values: z.array(z.number()).min(1).optional(), // Embedding vector
  score: z.number().min(0),
});

export type TNlqQaKnowledgeDto = z.infer<typeof nlqQaKnowledgeSchema>;

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

export const updateSplitterNameOnKnowledgeBaseDto = z.object({
  oldName: z.string().min(2),
  newName: z.string().min(2),
});

export type TUpdateSplitterNameOnKnowledgeBaseDto = z.infer<
  typeof updateSplitterNameOnKnowledgeBaseDto
>;
