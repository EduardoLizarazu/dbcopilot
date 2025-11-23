import { z } from "zod";
import { TDbConnectionOutRequestDto } from "../dbconnection.dto";

export enum NlqQaGoodWithExecutionStatus {
  FAILED = 0,
  OK = 1,
  NOTHING = 2,
  CORRECTED = 3,
  TO_DELETE = 4,
  UNKNOWN = -1,
}

export const nlqQaGoodSchema = z.object({
  id: z.string().min(2),
  question: z.string().min(2),
  query: z.string().min(2),
  originId: z.string().default(""), // FK to nlqQa
  dbConnectionId: z.string().min(2),

  executionStatus: z
    .nativeEnum(NlqQaGoodWithExecutionStatus)
    .default(NlqQaGoodWithExecutionStatus.UNKNOWN),

  // VDB
  knowledgeSourceId: z.string().default(""), // VDB - Same as this.id
  isOnKnowledgeSource: z.boolean().default(false), // If the question is on the VDB

  // Generated fields from the query and question
  detailQuestion: z.string().default(""), // detailed version of the question
  think: z.string().default(""), // how the query was built according to the question
  tablesColumns: z.array(z.string()).default([""]), // ["["SCHEMA"].[TABLE].[COLUMN]"] // To know which tables and columns were used
  semanticFields: z // To know the meaning of the fields
    .array(
      z.object({
        field: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .default([]),
  semanticTables: z // To know the meaning of the tables
    .array(
      z.object({
        table: z.string().min(1),
        purpose: z.string().min(1),
      })
    )
    .default([]),
  flags: z // To know the meaning of the flags used like why D2_TIPODOC='07'=Invoice
    .array(
      z.object({
        field: z.string().min(1),
        flag: z.string().min(1),
      })
    )
    .default([]),

  // Who did what and when
  isDelete: z.boolean().default(false),
  questionBy: z.string().default(""),
  createdBy: z.string().min(2),
  updatedBy: z.string().min(2),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type TNlqQaGoodDto = z.infer<typeof nlqQaGoodSchema>;

export const createNlqQaGoodSchema = nlqQaGoodSchema.omit({ id: true });
export type TCreateNlqQaGoodDto = z.infer<typeof createNlqQaGoodSchema>;

export const updateNlqQaGoodSchema = nlqQaGoodSchema.partial().omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateNlqQaGoodDto = z.infer<typeof updateNlqQaGoodSchema>;

export const updateNlqQaGoodOnKnowledgeSchema = nlqQaGoodSchema.pick({
  id: true,
  knowledgeSourceId: true,
  isOnKnowledgeSource: true,
});

export type TUpdateNlqQaGoodOnKnowledgeDto = z.infer<
  typeof updateNlqQaGoodOnKnowledgeSchema
>;

export const nlqQaGoodInRequestSchema = nlqQaGoodSchema
  .pick({
    question: true,
    query: true,
    originId: true,
    questionBy: true,
    dbConnectionId: true,
    detailQuestion: true,
    isOnKnowledgeSource: true,
    knowledgeSourceId: true,
    think: true,
    tablesColumns: true,
    semanticFields: true,
    semanticTables: true,
    flags: true,
    executionStatus: true,
  })
  .extend({
    actorId: z.string().min(2).optional(),
  });
export type TNlqQaGoodInRequestDto = z.infer<typeof nlqQaGoodInRequestSchema>;

export const updateNlqQaGoodInRqDto = nlqQaGoodInRequestSchema.extend({
  id: z.string().min(2),
});
export type TUpdateNlqQaGoodInRqDto = z.infer<typeof updateNlqQaGoodInRqDto>;

export type TNlqQaGoodOutRequestDto = z.infer<typeof nlqQaGoodSchema>;

export const nlqQaGoodWithExecution = nlqQaGoodSchema.extend({
  newQuestion: z.string().min(0).default(""),
  newQuery: z.string().min(0).default(""),
});
export type TNlqQaGoodWithExecutionDto = z.infer<typeof nlqQaGoodWithExecution>;

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

export const genTopologyInRequestSchema = nlqQaGoodSchema
  .pick({
    question: true,
    query: true,
  })
  .extend({
    actorId: z.string().min(2),
  });

export type TGenTopologyInRequestDto = z.infer<
  typeof genTopologyInRequestSchema
>;

export const genTopologyOutRequestSchema = nlqQaGoodSchema.pick({
  think: true,
  flags: true,
  tablesColumns: true,
  semanticFields: true,
  semanticTables: true,
});

export type TGenTopologyOutRequestDto = z.infer<
  typeof genTopologyOutRequestSchema
>;

/**
 * Remove db connection by id with the fields:
 * - dbConnectionId
 * - knowledgeSourceId
 * - isOnKnowledgeSource
 */

export const removeDbConnOnNlqQaGoodSchema = nlqQaGoodSchema.pick({
  id: true,
  dbConnectionId: true,
  knowledgeSourceId: true,
  isOnKnowledgeSource: true,
});
