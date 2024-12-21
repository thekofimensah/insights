import axios from 'axios'
import { debugAPI } from '@/utils/debug'

const API_KEY = 'CG-peU4FUU92pAYpWYHQJ5hZ5xN'
const BASE_URL = 'https://api.coingecko.com/api/v3'

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    x_cg_demo_api_key: API_KEY
  }
})

/**
 * Fetch market data for a specific coin
 */
export async function fetchCoinMarketData(id: string) {
  debugAPI('Fetching market data for coin: %s', id)
  const { data } = await api.get(`/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: true,
      developer_data: true,
      sparkline: true
    }
  })
  return data
}