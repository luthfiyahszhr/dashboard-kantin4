import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../auth/authTypes.ts';
import { getJwtSecret } from '../config/authConfig.ts';
import { AppError } from '../errors/AppError.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export function authenticate(
  userRepository: UserRepository = new UserRepository(),
): RequestHandler {
  return async (req, _res, next) => {
    const authorization = req.get('authorization');
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);
    if (!match) throw new AppError(401, 'Token autentikasi diperlukan');

    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(match[1], getJwtSecret(), { algorithms: ['HS256'] });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, 'Token tidak valid atau sudah kedaluwarsa');
    }

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !/^[1-9]\d*$/.test(payload.sub)
    ) {
      throw new AppError(401, 'Token tidak valid atau sudah kedaluwarsa');
    }

    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId)) {
      throw new AppError(401, 'Token tidak valid atau sudah kedaluwarsa');
    }
    const user = await userRepository.findPublicById(userId);
    if (!user) throw new AppError(401, 'Token tidak valid atau sudah kedaluwarsa');

    req.user = user;
    next();
  };
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Autentikasi diperlukan'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Anda tidak memiliki izin untuk mengakses resource ini'));
      return;
    }
    next();
  };
}

export function getAuthenticatedUser(
  req: Express.Request,
): NonNullable<Express.Request['user']> {
  if (!req.user) throw new AppError(401, 'Autentikasi diperlukan');
  return req.user;
}
