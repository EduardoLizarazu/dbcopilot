import { z } from "zod";
import { TDbConnectionOutRequestDto } from "../dbconnection.dto";

export const nlqQaGoodSchema = z.object({
  id: z.string(),
  question: z.string().min(2),
  query: z.string().min(2),
  originId: z.string(), // FK to nlqQa
  dbConnectionId: z.string().min(2),

  // VDB
  knowledgeSourceId: z.string().min(2), // VDB - Same as this.id
  isOnKnowledgeSource: z.boolean(), // If the question is on the VDB

  // Generated fields from the query and question
  detailQuestion: z.string().min(2),
  think: z.string().min(2), // how the query was built according to the question
  tablesColumns: z.array(z.string().min(1)).min(1), // ["[TABLE].[COLUMN]"] // To know which tables and columns were used
  semanticFields: z // To know the meaning of the fields
    .array(
      z.object({
        field: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  semanticTables: z // To know the meaning of the tables
    .array(
      z.object({
        table: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .min(1),
  flags: z // To know the meaning of the flags used like why D2_TIPODOC='07'=Invoice
    .array(
      z.object({
        field: z.string().min(1),
        flag: z.string().min(1),
      })
    )
    .min(1),

  // Who did what and when
  isDelete: z.boolean().default(false),
  questionBy: z.string().min(2),
  createdBy: z.string().min(2),
  updatedBy: z.string().min(2),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createNlqQaGoodSchema = nlqQaGoodSchema.omit({ id: true });
export type TCreateNlqQaGoodDto = z.infer<typeof createNlqQaGoodSchema>;

export const updateNlqQaGoodSchema = nlqQaGoodSchema.partial().omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateNlqQaGoodDto = z.infer<typeof updateNlqQaGoodSchema>;

export const nlqQaGoodInRequestSchema = nlqQaGoodSchema.partial().pick({
  question: true,
  query: true,
  originId: true,
  questionBy: true,
  createdBy: true,
  dbConnectionId: true,
});
export type TNlqQaGoodInRequestDto = z.infer<typeof nlqQaGoodInRequestSchema>;

export type TNlqQaGoodOutRequestDto = z.infer<typeof nlqQaGoodSchema>;

export type TNlqQaGoodOutWithUserAndConnRequestDto = TNlqQaGoodOutRequestDto & {
  user: {
    id: string;
    email: string;
  };
  dbConnection: TDbConnectionOutRequestDto;
};

/**
 * NLQ QA Good is that any sql that has been marked as:
 * - Good feedback from the analyst
 * - Has been corrected by IT, either by:
 *    - Bad feedback from the analyst
 *    - Error in the query or suggestion by the system
 */
