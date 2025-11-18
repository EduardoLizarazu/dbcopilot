// {
//     "TABLE_SCHEMA": "TMPRD",
//     "TABLE_NAME": "CT1300",
//     "COLUMN_NAME": "T1_CUSTRANS",
//     "DATA_TYPE": "NUMBER",
//     "DATA_LENGTH": 22,
//     "DATA_PRECISION": 38,
//     "DATA_SCALE": 0,
//     "NULLABLE": "Y",
//     "IS_PRIMARY_KEY": "FALSE",
//     "IS_FOREIGN_KEY": "FALSE",
//     "REFERENCED_TABLE_SCHEMA": null,
//     "REFERENCED_TABLE_NAME": null,
//     "REFERENCED_COLUMN_NAME": null
// }

import { z } from "zod";
// array of object
export const nlqQaInformationSchemaExtraction = z.array(
  z.object({
    TABLE_SCHEMA: z.string(),
    TABLE_NAME: z.string(),
    COLUMN_NAME: z.string(),
    DATA_TYPE: z.string(),
    DATA_LENGTH: z.number().nullable().optional(),
    DATA_PRECISION: z.number().nullable().optional(),
    DATA_SCALE: z.number().nullable().optional(),
    NULLABLE: z.string().nullable().optional(),
    IS_PRIMARY_KEY: z.string().nullable().optional(),
    IS_FOREIGN_KEY: z.string().nullable().optional(),
    REFERENCED_TABLE_SCHEMA: z.string().nullable().optional(),
    REFERENCED_TABLE_NAME: z.string().nullable().optional(),
    REFERENCED_COLUMN_NAME: z.string().nullable().optional(),
  })
);
export type TNlqQaInformationSchemaExtractionDto = z.infer<
  typeof nlqQaInformationSchemaExtraction
>;

export type TNlqInformationData = {
  data: Record<string, unknown>[]; // Adjust the type based on your data structure
};

export const connDto = z.object({
  type: z.enum(["mysql", "postgres", "mssql", "oracle"]),
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port is required"),
  database: z.string().min(1, "Database is required"),
  username: z.string().min(1, "User is required"),
  password: z.string().min(1, "Password is required"),
  sid: z.string().optional().nullable(),
  schema_query: z.string().optional(),
});
export type TNlqInfoConnDto = z.infer<typeof connDto>;

export const nlqInfoExtractorSchema = connDto
  .omit({
    schema_query: true,
  })
  .extend({
    query: z.string().min(1, "Query is required"),
  });

export type TNlqInfoExtractorDto = z.infer<typeof nlqInfoExtractorSchema>;

export const nlqQaInfoExtractorInRequestSchema = z.object({
  connId: z.string().min(1, "Connection ID is required"),
  query: z.string().min(1, "Query is required"),
});

export type TNlqQaInfoExtractorInRequestDto = z.infer<
  typeof nlqQaInfoExtractorInRequestSchema
>;
