import { createContext } from 'react'

export interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error'
}

export interface ToastContextValue {
  messages: ToastMessage[]
  notify: (message: string, type?: ToastMessage['type']) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)