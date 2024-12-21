import { debugCache } from '@/utils/debug'
import type { Cache, CacheOptions, CacheItem } from './types'

export class MemoryCache<T> implements Cache<T> {
  private cache: Map<string, CacheItem<T>>
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.cache = new Map()
    this.options = {
      duration: options.duration || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 1000,
    }
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.duration
  }

  async get(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    
    if (!item) {
      debugCache('Cache miss: %s', key)
      return null
    }

    if (this.isExpired(item.timestamp)) {
      debugCache('Cache expired: %s', key)
      this.cache.delete(key)
      return null
    }

    debugCache('Cache hit: %s', key)
    return item.data
  }

  async set(key: string, value: T): Promise<void> {
    // Enforce max size
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0]
      this.cache.delete(oldestKey)
    }

    debugCache('Cache set: %s', key)
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    })
  }

  async clear(): Promise<void> {
    debugCache('Cache cleared')
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }
}