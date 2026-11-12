import type { AuthenticatedUser } from '../auth/authTypes.ts';

export type UserResponseDto = AuthenticatedUser;

export interface LoginResponseDto {
  user: UserResponseDto;
  token: string;
}
