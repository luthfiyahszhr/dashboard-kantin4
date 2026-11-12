import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { SESSION_EXPIRED_EVENT, TOKEN_STORAGE_KEY } from '../api/client'
import { AuthContext } from './authContextValue'
import type { LoginInput, RegisterInput } from '../api/auth'
import type { User } from '../types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(TOKEN_STORAGE_KEY))
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const restoreStarted = useRef(false)

  useEffect(() => {
    const clearSession = () => {
      setToken(null)
      setUser(null)
      setSessionExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, clearSession)

    const restoreSession = async () => {
      if (!window.localStorage.getItem(TOKEN_STORAGE_KEY)) {
        setLoading(false)
        return
      }
      try {
        setUser(await authApi.getMe())
      } catch {
        if (!window.localStorage.getItem(TOKEN_STORAGE_KEY)) clearSession()
      } finally {
        setLoading(false)
      }
    }
    if (!restoreStarted.current) {
      restoreStarted.current = true
      void restoreSession()
    }
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, clearSession)
  }, [])

  const login = async (input: LoginInput) => {
    const result = await authApi.login(input)
    window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    setSessionExpired(false)
  }

  const register = (input: RegisterInput) => authApi.register(input)

  const logout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
    setSessionExpired(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, sessionExpired, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}