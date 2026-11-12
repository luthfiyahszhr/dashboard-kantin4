import axios, { type AxiosError } from 'axios'
import type { ApiError, ApiFieldError } from '../types/api'

export const TOKEN_STORAGE_KEY = 'kantin-review-token'
export const SESSION_EXPIRED_EVENT = 'kantin:session-expired'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ApiError>(error)) return Promise.reject(error)

    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isCredentialRequest = /\/auth\/(login|register)$/.test(requestUrl)
      if (!isCredentialRequest) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY)
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
      }
    }

    if (error.response?.status === 403) error.message = 'Tidak punya akses.'
    if (!error.response) error.message = 'Server tidak dapat dihubungi.'
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    if (error.response?.status === 403) return 'Tidak punya akses.'
    if (error.response?.status === 401 && !/\/auth\/(login|register)$/.test(error.config?.url ?? '')) {
      return 'Sesi berakhir.'
    }
    if (!error.response) return 'Server tidak dapat dihubungi.'
    const payload = error.response.data
    return formatUserMessage(payload?.message || error.message)
  }
  return formatUserMessage(error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.')
}

function formatUserMessage(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) return 'Terjadi kesalahan yang tidak diketahui.'
  const capitalized = trimmed[0].toLocaleUpperCase() + trimmed.slice(1)
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiError>(error)) return {}
  return (error.response?.data?.errors ?? []).reduce<Record<string, string>>(
    (result, item: ApiFieldError) => {
      result[item.field] = formatUserMessage(item.message)
      return result
    },
    {},
  )
}

export function getHttpStatus(error: unknown): number | undefined {
  return (error as AxiosError<ApiError> | undefined)?.response?.status
}