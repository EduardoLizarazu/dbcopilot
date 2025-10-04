import { z } from "zod";

export const VbdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  createdBy: z.string().min(2).max(100),
  updatedBy: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVbdSchema = VbdSchema.omit({ id: true });

export type TCreateVbdDto = z.infer<typeof createVbdSchema>;

export const updateVbdSchema = VbdSchema.omit({
  createdAt: true,
  createdBy: true,
});

export type TUpdateVbdDto = z.infer<typeof updateVbdSchema>;

export const vbdInRequestSchema = VbdSchema.partial()
  .pick({
    id: true,
    name: true,
  })
  .extend({
    actorId: z.string().min(2),
  });
export type TVbdInRequestDto = z.infer<typeof vbdInRequestSchema>;

export type TVbdOutRequestDto = z.infer<typeof VbdSchema>;
