import axios, { AxiosInstance, AxiosError } from 'axios'
import { debugAPI } from '@/utils/debug'
import type { ApiConfig, ApiResponse, ApiError } from './types'

export class ApiClient {
  private client: AxiosInstance

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        ...(config.apiKey && { 'x-api-key': config.apiKey }),
        ...config.headers,
      },
    })

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        debugAPI('API Response: %o', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        })
        return response
      },
      (error: AxiosError) => {
        debugAPI('API Error: %o', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        })
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    return {
      message: error.message,
      status: error.response?.status || 500,
      code: error.code,
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      debugAPI('API Request: GET %s %o', url, params)
      const response = await this.client.get<T>(url, { params })
      return {
        data: response.data,
        error: null,
        status: response.status,
      }
    } catch (error) {
      const apiError = error as ApiError
      return {
        data: null as T,
        error: apiError.message,
        status: apiError.status,
      }
    }
  }
}