export interface CacheOptions {
  duration?: number // Cache duration in milliseconds
  maxSize?: number // Maximum number of items to cache
}

export interface CacheItem<T> {
  data: T
  timestamp: number
}

export interface Cache<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}