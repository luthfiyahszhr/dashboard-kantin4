import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, type ErrorDetail } from '../errors/AppError.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const notFoundHandler: RequestHandler = (req, res, next) => {
  next(new AppError(404, `Endpoint ${req.method} ${req.path} tidak ditemukan`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    const errors: ErrorDetail[] = error.issues.map((issue) => ({
      field: issue.path.map(String).join('.') || 'request',
      message: issue.message,
    }));
    res.status(400).json({ message: 'Validasi input gagal', errors });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  if (isRecord(error) && error.type === 'entity.parse.failed') {
    res.status(400).json({
      message: 'Format JSON tidak valid',
      errors: [{ field: 'body', message: 'Request body harus berupa JSON yang valid' }],
    });
    return;
  }

  if (isRecord(error) && error.type === 'entity.too.large') {
    res.status(413).json({ message: 'Ukuran request terlalu besar' });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: 'Terjadi kesalahan internal pada server',
  });
};
