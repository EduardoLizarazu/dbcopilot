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
const nlqQaInformationSchemaExtraction = z.array(
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
);
export type TNlqQaInformationSchemaExtractionDto = z.infer<
  typeof nlqQaInformationSchemaExtraction
>;

export type TNlqInformationData = {
  data: Record<string, unknown>[]; // Adjust the type based on your data structure
};

export const TNlqInfoConn = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port is required"),
  database: z.string().min(1, "Database is required"),
  user: z.string().min(1, "User is required"),
  password: z.string().min(1, "Password is required"),
  sid: z.string().optional(),
});
export type TNlqInfoConnDto = z.infer<typeof TNlqInfoConn>;
