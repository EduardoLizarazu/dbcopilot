import { z } from "zod";

/**
 * NLQ QA Details Schema
 */

export const nlqQaGoodDetailsSchema = z.object({
  id: z.string(),
  // knowledgeSourceId: z.string().min(2), // VDB
  // isOnKnowledgeSource: z.boolean(),
  // originalQuestion: z.string().min(2),

  query: z.string().min(2),
  think: z.string().min(2),
  intent: z.string().min(2),
  domain: z.string().min(2),
  tablesColumns: z.array(z.string().min(1)).min(1), // ["[TABLE].[COLUMN]"]
  joinsTableNames: z
    .array(
      z.object({
        table1: z.string().min(1),
        table2: z.string().min(1),
      })
    ) // [ { "table1": "SD2300", "table2": "SC6300" } ]
    .min(1),
  joinsTableColumns: z
    .array(
      z.object({
        tableField1: z.string().min(1),
        tableField2: z.string().min(1),
      })
    ) // [ { "tableField1": "SD2300.(D2_PEDIDO, D2_SEQUEN, D2_ITEMPV)", "tableField2": "SC6300.(C6_NUM, C6_ITEM, C6_ITEM)" } ]
    .min(1),
  //   Semantic fields is an array of objects with name and type
  semanticFields: z
    .array(
      z.object({
        field: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  semanticTables: z
    .array(
      z.object({
        table: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  flags: z
    .array(
      z.object({
        field: z.string().min(1),
        flag: z.string().min(1),
      })
    )
    .min(1),
  aggregations: z
    .array(
      z.object({
        aggregate: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  subqueries: z
    .array(
      z.object({
        alias: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  createdAt: z.date(),
  createdBy: z.string(),
  updatedAt: z.date(),
  updatedBy: z.string(),
});

export const createNlqQaGoodDetailsSchema = nlqQaGoodDetailsSchema.omit({
  id: true,
});

export type TCreateNlqQaGoodDetailsDto = z.infer<
  typeof createNlqQaGoodDetailsSchema
>;

export const updateNlqQaGoodDetailsSchema = nlqQaGoodDetailsSchema.omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateNlqQaGoodDetailsDto = z.infer<
  typeof updateNlqQaGoodDetailsSchema
>;

export type TNlqQaGoodDetailsInRequestDto = z.infer<
  typeof nlqQaGoodDetailsSchema
>;
export type TNlqQaGoodDetailsOutRequestDto = z.infer<
  typeof nlqQaGoodDetailsSchema
>;
