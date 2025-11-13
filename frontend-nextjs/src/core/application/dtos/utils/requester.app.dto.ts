import z from "zod";

export const requesterSchema = z.object({
  uid: z.string().min(1, "ID is required"),
  roles: z.array(z.string().min(1, "Role is required")),
});

export type TRequesterDto = z.infer<typeof requesterSchema>;
