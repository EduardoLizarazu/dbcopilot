import { array, z } from "zod";

// Login DTO
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type TLoginDto = z.infer<typeof loginSchema>;

// Token decoded DTO
export const tokenDecodedSchema = z.object({
  uid: z.string(),
});
export type TTokenDecodedDto = z.infer<typeof tokenDecodedSchema>;

// Authorize DTO
export const authorizeSchema = z.object({
  uid: z.string(),
  roleName: array(z.string()).min(1, "At least one role is required"),
});

export type TAuthorizeDto = z.infer<typeof authorizeSchema>;
