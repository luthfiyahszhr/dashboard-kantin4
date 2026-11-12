import { apiClient } from './client'
import type { ApiEnvelope, LoginResponse, User } from '../types/api'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await apiClient.post<ApiEnvelope<User>>('/auth/register', input)
  return response.data.data
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', input)
  return response.data.data
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiEnvelope<User>>('/auth/me')
  return response.data.data
}