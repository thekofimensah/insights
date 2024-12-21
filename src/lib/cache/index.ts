import { MemoryCache } from './memory-cache'

// Create cache instances
export const coinCache = new MemoryCache({
  duration: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
})

export const marketDataCache = new MemoryCache({
  duration: 60 * 1000, // 1 minute
  maxSize: 100,
})

export * from './types'