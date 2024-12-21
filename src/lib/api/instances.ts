import { ApiClient } from './client'
import { API_CONFIG } from './config'

// Create API client instances
export const coingeckoApi = new ApiClient({
  baseUrl: API_CONFIG.coingecko.baseUrl,
  apiKey: API_CONFIG.coingecko.apiKey,
})

export const dexscreenerApi = new ApiClient({
  baseUrl: API_CONFIG.dexscreener.baseUrl,
})