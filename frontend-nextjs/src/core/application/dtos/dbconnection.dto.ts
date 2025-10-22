import { z } from "zod";
import { TVbdOutRequestDto } from "./vbd.dto";

export const dbType = z.enum(["mysql", "postgres", "mssql", "oracle"]);
export const baseConn = z.object({
  type: dbType,
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  sid: z.string().optional().nullable().default(""), // oracle
});

export const dbConnectionSchema = baseConn.extend({
  id: z.string().min(2).max(100),
  id_vbd_splitter: z.string().min(2).max(100),

  name: z.string().min(2).max(100),
  description: z.string().min(0).max(255).default(""),

  schema_query: z.string().min(2),

  createdBy: z.string().min(2).max(100),
  updatedBy: z.string().min(2).max(100),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const createDbConnectionSchema = dbConnectionSchema.omit({ id: true });
export type TCreateDbConnectionDto = z.infer<typeof createDbConnectionSchema>;

export const updateDbConnectionSchema = dbConnectionSchema.pick({
  id: true,
  id_vbd_splitter: true,
  name: true,
  username: true,
  password: true,
  description: true,
  updatedBy: true,
  updatedAt: true,
  schema_query: true,
});
export type TUpdateDbConnectionDto = z.infer<typeof updateDbConnectionSchema>;

export const createDbConnInRqSchema = dbConnectionSchema
  .pick({
    id_vbd_splitter: true,
    name: true,
    description: true,
    type: true,
    host: true,
    password: true,
    port: true,
    database: true,
    username: true,
    sid: true,
    schema_query: true,
  })
  .extend({
    actorId: z.string().min(2).max(100),
  });

export type TCreateDbConnInReqDto = z.infer<typeof createDbConnInRqSchema>;

export const updateDbConnInRqSchema = createDbConnInRqSchema.extend({
  id: z.string().min(2).max(100),
});

export type TUpdateDbConnInReqDto = z.infer<typeof updateDbConnInRqSchema>;

export type TDbConnectionOutRequestDto = z.infer<typeof dbConnectionSchema>;

export type TDbConnectionOutRequestDtoWithVbAndUser =
  TDbConnectionOutRequestDto & {
    vbd_splitter: TVbdOutRequestDto | null;
    user: { id: string; email: string } | null;
  };

export type TDbConnectionOutRequestDtoWithVbd = TDbConnectionOutRequestDto & {
  vbd_splitter: TVbdOutRequestDto;
};

export const dbConnStringSchema = dbConnectionSchema.pick({
  type: true,
  host: true,
  port: true,
  database: true,
  username: true,
  password: true,
});

export type TDbConnStringDto = z.infer<typeof dbConnStringSchema>;
