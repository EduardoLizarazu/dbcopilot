import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  lastname: z.string().min(1, "Lastname is required"),
  roles: z.array(z.string()),
});

export const createUserSchema = userSchema.omit({ id: true });

// Create user DTO
export type TCreateUserDto = z.infer<typeof createUserSchema>;

// Update user DTO
export const updateUserSchema = userSchema.partial();
export type TUpdateUserDto = z.infer<typeof updateUserSchema>;

// User Input Request DTO

export type TUserInputRequestDto = z.infer<typeof userSchema>;

// User Output Request DTO
export const userOutputRequestSchema = userSchema.omit({ password: true });
export type TUserOutputRequestDto = z.infer<typeof userOutputRequestSchema>;

export type TUserOutRequestWithRoles = TUserOutputRequestDto & {
  rolesDetail: {
    id: string;
    name: string;
  }[];
};
