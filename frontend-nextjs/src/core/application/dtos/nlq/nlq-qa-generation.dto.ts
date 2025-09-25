import { z } from "zod";

export const nlqQaGenerationSchema = z.object({
  question: z.string(),
  similarKnowledgeBased: z.array(
    z.object({
      id: z.string(),
      nlqQaGoodId: z.string().min(2),
      question: z.string().min(2),
      query: z.string().min(2),
      tablesColumns: z.array(z.string().min(1)).min(1), // ["[TABLE].[COLUMN]"]
      score: z.number(),
    })
  ),
  schemaBased: z.array(
    z.object({
      TABLE_SCHEMA: z.string(),
      TABLE_NAME: z.string(),
      COLUMN_NAME: z.string(),
      DATA_TYPE: z.string(),
      DATA_LENGTH: z.number(),
      DATA_PRECISION: z.number(),
      DATA_SCALE: z.number(),
      NULLABLE: z.string(),
      IS_PRIMARY_KEY: z.string(),
      IS_FOREIGN_KEY: z.string(),
      REFERENCED_TABLE_SCHEMA: z.string().nullable(),
      REFERENCED_TABLE_NAME: z.string().nullable(),
      REFERENCED_COLUMN_NAME: z.string().nullable(),
    })
  ),
  answer: z.string(),
});

// Create prompt template
export const createNlqQaGenerationPromptTemplate = nlqQaGenerationSchema.pick({
  question: true,
  similarKnowledgeBased: true,
  schemaBased: true,
});

export type TCreateNlqQaGenerationPromptTemplate = z.infer<
  typeof createNlqQaGenerationPromptTemplate
>;

// Output
export const nlqQaGenerationOutSchema = nlqQaGenerationSchema.pick({
  answer: true,
});

export type TNlqQaGenerationOutRequestDto = z.infer<
  typeof nlqQaGenerationOutSchema
>;
