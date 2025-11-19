import { z } from "zod";
import { nlqQaInformationSchemaExtraction } from "./nlq/nlq-qa-information.app.dto";

const schemaCtxAliases = z.array(z.string());
export enum SchemaCtxDiffStatus {
  UN_CHANGE = 0,
  NEW = 1,
  DELETE = 2,
  UPDATE = 3,
}
export type TSchemaCtxDiffStatus = keyof typeof SchemaCtxDiffStatus;
export type TSchemaCtxRaw = z.infer<typeof nlqQaInformationSchemaExtraction>;

// ===== COLUMN PROFILE =====
export const schemaCtxColumnProfile = z.object({
  maxValue: z.string().optional().default(""),
  minValue: z.string().optional().default(""),
  countNulls: z.number().default(0),
  countUnique: z.number().default(0),
  sampleUnique: z.array(z.string()).default([]),
});
export type TSchemaCtxColumnProfileDto = z.infer<typeof schemaCtxColumnProfile>;

// ===== COLUMN CTX =====
export const schemaCtxColumn = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  aliases: schemaCtxAliases.default([]),
  dataType: z.string().min(1),
  profile: schemaCtxColumnProfile.default({}),
});
export type TSchemaCtxColumnDto = z.infer<typeof schemaCtxColumn>;
export const schemaCtxDiffColumn = schemaCtxColumn
  .omit({
    profile: true,
    aliases: true,
    description: true,
  })
  .extend({
    status: z.nativeEnum(SchemaCtxDiffStatus),
    dataType: z.object({
      name: z.string().min(1),
      status: z.nativeEnum(SchemaCtxDiffStatus),
    }),
  });
export type TSchemaCtxDiffColumnDto = z.infer<typeof schemaCtxDiffColumn>;

// ===== TABLE CTX =====
export const schemaCtxTable = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  aliases: schemaCtxAliases.default([]),
  columns: z.array(schemaCtxColumn).default([]),
});
export type TSchemaCtxTableDto = z.infer<typeof schemaCtxTable>;
export const schemaCtxDiffTable = schemaCtxTable
  .omit({
    aliases: true,
    description: true,
  })
  .extend({
    columns: z.array(schemaCtxDiffColumn).default([]),
    status: z.nativeEnum(SchemaCtxDiffStatus),
  });
export type TSchemaCtxDiffTableDto = z.infer<typeof schemaCtxDiffTable>;

// ===== SCHEMA CTX SCHEMA =====
export const schemaCtxSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  aliases: schemaCtxAliases.default([]),
  tables: z.array(schemaCtxTable).default([]),
});
export type TSchemaCtxSchemaDto = z.infer<typeof schemaCtxSchema>;
export const schemaCtxDiffSchema = schemaCtxSchema
  .omit({
    aliases: true,
    description: true,
  })
  .extend({
    status: z.nativeEnum(SchemaCtxDiffStatus),
    tables: z.array(schemaCtxDiffTable).default([]),
  });
export type TSchemaCtxDiffSchemaDto = z.infer<typeof schemaCtxDiffSchema>;

// ===== BASED SCHEMA CTX =====
export const schemaCtxBase = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  dbConnectionIds: z.array(z.string().min(1)),
  schemaCtx: z.array(schemaCtxSchema).default([]),
});

export type TSchemaCtxBaseDto = z.infer<typeof schemaCtxBase>;

export const schemaCtxDiffBase = schemaCtxBase
  .omit({ schemaCtx: true })
  .extend({
    schemaCtx: z.array(schemaCtxDiffSchema).default([]),
  });

export type TSchemaCtxDiffBaseDto = z.infer<typeof schemaCtxDiffBase>;

export const createSchemaCtxBase = schemaCtxBase.omit({ id: true });
export type TCreateSchemaCtxBaseDto = z.infer<typeof createSchemaCtxBase>;

export const createSchemaCtxBaseInReq = createSchemaCtxBase
  .omit({
    schemaCtx: true,
  })
  .extend({
    schemaCtx: nlqQaInformationSchemaExtraction,
  });
export type TCreateSchemaCtxBaseInReqDto = z.infer<
  typeof createSchemaCtxBaseInReq
>;

export const updateSchemaCtxBaseInReq = schemaCtxBase
  .omit({ schemaCtx: true })
  .extend({
    schemaCtx: nlqQaInformationSchemaExtraction,
  });
export type TUpdateSchemaCtxBaseInReqDto = z.infer<
  typeof updateSchemaCtxBaseInReq
>;

// ======== EXTRA TYPES ========
export const schemaCtxSimpleTableDto = schemaCtxTable
  .omit({ columns: true })
  .extend({
    column: schemaCtxColumn,
  });
export const schemaCtxSimpleSchemaDto = schemaCtxSchema
  .omit({ tables: true })
  .extend({
    table: schemaCtxSimpleTableDto,
  });
export type TSchemaCtxSimpleSchemaDto = z.infer<
  typeof schemaCtxSimpleSchemaDto
>;

export const schemaCtxCounterDto = z.object({
  totalUnChanged: z.number().min(0),
  totalNews: z.number().min(0),
  totalDeleted: z.number().min(0),
});
export type TSchemaCtxCounterDto = z.infer<typeof schemaCtxCounterDto>;
