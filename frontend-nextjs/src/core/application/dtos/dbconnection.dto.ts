import { z } from "zod";
import { TVbdOutRequestDto } from "./vbd.dto";

export const dbConnectionSchema = z.object({
  id: z.string().min(2).max(100),
  id_vbd_splitter: z.string().min(2).max(100),

  name: z.string().min(2).max(100),
  description: z.string().min(0).max(255).default(""),

  type: z.enum(["mysql", "postgres", "mssql", "oracle"]),
  host: z.string().min(1).max(255),
  port: z.number().min(1).max(65535),
  database: z.string().min(1).max(255),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
  sid: z.string().optional().nullable().default(""), // oracle

  schema_query: z.string().min(2),

  createdBy: z.string().min(2).max(100),
  updatedBy: z.string().min(2).max(100),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const createDbConnectionSchema = dbConnectionSchema.omit({ id: true });
export type TCreateDbConnectionDto = z.infer<typeof createDbConnectionSchema>;

export const updateDbConnectionSchema = dbConnectionSchema.omit({
  createdAt: true,
  createdBy: true,
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
