import { apiClient } from './client'
import type {
  ApiEnvelope,
  MenuItem,
  Stall,
  StallInput,
  StallListResponse,
  StallQuery,
} from '../types/api'

export async function getStalls(params: StallQuery = {}): Promise<StallListResponse> {
  const response = await apiClient.get<StallListResponse>('/stalls', { params })
  return response.data
}

export async function getStallById(id: number): Promise<Stall> {
  const response = await apiClient.get<ApiEnvelope<Stall>>(`/stalls/${id}`)
  return response.data.data
}

export async function getStallMenus(id: number): Promise<MenuItem[]> {
  const response = await apiClient.get<ApiEnvelope<MenuItem[]>>(`/stalls/${id}/menus`)
  return response.data.data
}

export async function createStall(input: StallInput): Promise<Stall> {
  const response = await apiClient.post<ApiEnvelope<Stall>>('/stalls', input)
  return response.data.data
}

export async function updateStall(id: number, input: Partial<StallInput>): Promise<Stall> {
  const response = await apiClient.put<ApiEnvelope<Stall>>(`/stalls/${id}`, input)
  return response.data.data
}

export async function deleteStall(id: number): Promise<Stall> {
  const response = await apiClient.delete<ApiEnvelope<Stall>>(`/stalls/${id}`)
  return response.data.data
}