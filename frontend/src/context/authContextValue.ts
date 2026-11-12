import { createContext } from 'react'
import type { LoginInput, RegisterInput } from '../api/auth'
import type { User } from '../types/api'

export interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  sessionExpired: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)