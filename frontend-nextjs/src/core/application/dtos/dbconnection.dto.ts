import { z } from "zod";

export const dbConnectionSchema = z.object({
  id: z.string().min(2).max(100),
  id_vbd_splitter: z.string().min(2).max(100),

  host: z.string().min(1).max(255),
  port: z.number().min(1).max(65535),
  database: z.string().min(1).max(255),
  user: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
  sid: z.string().optional(), // oracle

  createdBy: z.string().min(2).max(100),
  updatedBy: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createDbConnectionSchema = dbConnectionSchema.omit({ id: true });
export type TCreateDbConnectionDto = z.infer<typeof createDbConnectionSchema>;

export const updateDbConnectionSchema = dbConnectionSchema.omit({
  createdAt: true,
  createdBy: true,
});
export type TUpdateDbConnectionDto = z.infer<typeof updateDbConnectionSchema>;

export const dbConnectionInRequestSchema = dbConnectionSchema.partial().pick({
  id: true,
  id_vbd_splitter: true,
  host: true,
  port: true,
  database: true,
  user: true,
  sid: true,
});

export type TDbConnectionInRequestDto = z.infer<
  typeof dbConnectionInRequestSchema
>;

export type TDbConnectionOutRequestDto = z.infer<typeof dbConnectionSchema>;
