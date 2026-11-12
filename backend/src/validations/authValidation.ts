import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email().max(150);

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: emailSchema,
  password: z
    .string()
    .min(8)
    .max(72)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
      message: 'Password maksimal 72 byte',
    }),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .max(72)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
      message: 'Password maksimal 72 byte',
    }),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
