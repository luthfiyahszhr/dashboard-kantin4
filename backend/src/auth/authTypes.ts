export const userRoles = ['admin', 'owner', 'customer'] as const;

export type UserRole = (typeof userRoles)[number];

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
