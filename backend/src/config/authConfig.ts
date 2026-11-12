import { AppError } from '../errors/AppError.ts';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new AppError(500, 'Konfigurasi autentikasi server belum tersedia');
  }
  return secret;
}

export function assertAuthConfiguration(): void {
  getJwtSecret();
}
