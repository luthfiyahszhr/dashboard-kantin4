import { z } from 'zod';

const requestInteger = z
  .string()
  .regex(/^\d+$/, 'Harus berupa integer')
  .transform(Number)
  .pipe(z.number().int());

export const stallListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  page: requestInteger.pipe(z.number().int().min(1)).optional().default(1),
  limit: requestInteger.pipe(z.number().int().min(1).max(100)).optional().default(10),
});

export const stallIdParamsSchema = z.object({
  id: requestInteger.pipe(z.number().int().positive()),
});

export const createStallSchema = z.object({
  name: z.string().trim().min(3).max(100),
  category: z.string().trim().max(50).optional(),
  location: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
}).strict();

export const updateStallSchema = createStallSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
}).strict();

export type StallListQuery = z.infer<typeof stallListQuerySchema>;
export type StallIdParams = z.infer<typeof stallIdParamsSchema>;
export type CreateStallInput = z.infer<typeof createStallSchema>;
export type UpdateStallInput = z.infer<typeof updateStallSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
