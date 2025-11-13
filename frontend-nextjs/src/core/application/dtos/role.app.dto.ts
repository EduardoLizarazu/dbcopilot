import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createRoleSchema = roleSchema.omit({ id: true });

// Create role DTO
export type TCreateRoleDto = z.infer<typeof createRoleSchema>;

// Update role DTO
export const updateRoleSchema = roleSchema.omit({
  createdAt: true,
  createdBy: true,
});
export type TUpdateRoleDto = z.infer<typeof updateRoleSchema>;

export type TRoleInRequestDto = z.infer<typeof roleSchema>;

export type TRoleOutRequestDto = z.infer<typeof roleSchema>;
