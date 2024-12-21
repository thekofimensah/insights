export interface ApiResponse<T> {
  data: T
  error: string | null
  status: number
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
  headers?: Record<string, string>
}