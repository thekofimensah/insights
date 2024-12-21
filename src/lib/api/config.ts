// API configuration and constants
export const API_CONFIG = {
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: 'CG-peU4FUU92pAYpWYHQJ5hZ5xN',
  },
  dexscreener: {
    baseUrl: 'https://api.dexscreener.com/latest/dex',
  },
} as const

// API endpoints
export const ENDPOINTS = {
  coingecko: {
    coinList: '/coins/list',
    coinMarkets: '/coins/markets',
    coin: (id: string) => `/coins/${id}`,
  },
  dexscreener: {
    tokens: (addresses: string[]) => `/tokens/${addresses.join(',')}`,
  },
} as const