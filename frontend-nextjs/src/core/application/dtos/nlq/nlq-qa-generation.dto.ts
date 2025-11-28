import { z } from "zod";
import { schemaCtxSchema } from "../schemaCtx.dto";

export const nlqQaGenerationSchema = z.object({
  question: z.string(),
  similarKnowledgeBased: z.array(
    z.object({
      id: z.string().min(2),
      nlqQaGoodId: z.string().min(2),
      question: z.string().min(2),
      query: z.string().min(2),
      tablesColumns: z.array(z.string()), // ["[TABLE].[COLUMN]"]
      score: z.number(),
    })
  ),
  schemaBased: z.array(
    z.object({
      TABLE_SCHEMA: z.string(),
      TABLE_NAME: z.string(),
      COLUMN_NAME: z.string(),
      DATA_TYPE: z.string(),
      DATA_LENGTH: z.number().optional(),
      DATA_PRECISION: z.number().optional(),
      DATA_SCALE: z.number().optional(),
      NULLABLE: z.string().optional(),
      IS_PRIMARY_KEY: z.string().optional(),
      IS_FOREIGN_KEY: z.string().optional(),
      REFERENCED_TABLE_SCHEMA: z.string().nullable().optional(),
      REFERENCED_TABLE_NAME: z.string().nullable().optional(),
      REFERENCED_COLUMN_NAME: z.string().nullable().optional(),
    })
  ),
  answer: z.string(),
  dbType: z.string(),
});

// Create prompt template 40190
export const createNlqQaGenerationPromptTemplate = nlqQaGenerationSchema.pick({
  question: true,
  similarKnowledgeBased: true,
  dbType: true,
  schemaBased: true,
});
// .extend({
//   schemaBased: z.array(schemaCtxSchema), // SCHEMA CONTEXT
// });

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
