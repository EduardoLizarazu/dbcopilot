import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const createRoleSchema = roleSchema.omit({ id: true });

// Create role DTO
export type TCreateRoleDto = z.infer<typeof createRoleSchema>;

export type TUpdateRoleDto = z.infer<typeof roleSchema>;

export type TRoleInRequestDto = z.infer<typeof roleSchema>;

export type TRoleOutRequestDto = z.infer<typeof roleSchema>;
