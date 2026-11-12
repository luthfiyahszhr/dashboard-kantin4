import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { AppError } from '../errors/AppError.ts';
import type { AuthenticatedUser, UserRole } from '../auth/authTypes.ts';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as {
    number?: unknown;
    originalError?: { info?: { number?: unknown } };
  };
  const code = candidate.number ?? candidate.originalError?.info?.number;
  return code === 2601 || code === 2627;
}

export class UserRepository {
  async findByEmail(email: string) {
    const db = await getDb();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email));
    return rows[0];
  }

  async findPublicById(id: number): Promise<AuthenticatedUser | undefined> {
    const db = await getDb();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id));

    const user = rows[0];
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
  }

  async create(input: CreateUserInput): Promise<AuthenticatedUser> {
    const db = await getDb();
    try {
      const rows = await db
        .insert(users)
        .output()
        .values({
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          role: 'customer',
        });
      const user = rows[0];
      if (!user) throw new Error('USER_INSERT_RETURNED_NO_ROW');
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, 'Email sudah terdaftar', [
          { field: 'email', message: 'Email sudah digunakan' },
        ]);
      }
      throw error;
    }
  }
}
