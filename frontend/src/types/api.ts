export type Role = 'admin' | 'owner' | 'customer'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Stall {
  id: number
  ownerId: number
  name: string
  category: string | null
  location: string | null
  description: string | null
  avgRating: number
  reviewCount: number
  isPopular: boolean
}

export interface MenuItem {
  id: number
  stallId: number
  name: string
  price: number
  isAvailable: boolean
}

export interface ApiEnvelope<T> {
  status: 'success'
  data: T
}

export interface StallListResponse {
  status: 'success'
  meta: {
    page: number
    limit: number
    total: number
  }
  data: Stall[]
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiError {
  message: string
  errors?: ApiFieldError[]
}

export interface LoginResponse {
  user: User
  token: string
}

export interface StallInput {
  name: string
  category?: string
  location?: string
  description?: string
}

export interface StallQuery {
  search?: string
  category?: string
  page?: number
  limit?: number
}