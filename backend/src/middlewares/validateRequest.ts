import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/AppError.ts';

export type ValidationTarget = 'body' | 'params' | 'query';

export function validateRequest<T extends z.ZodType>(
  schema: T,
  target: ValidationTarget,
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || target,
        message: issue.message,
      }));

      return next(new AppError(400, 'Validasi input gagal', errors));
    }

    const localsKey = `validated${target[0].toUpperCase()}${target.slice(1)}`;
    res.locals[localsKey] = result.data;
    return next();
  };
}
