import axios from 'axios'
import { debugAPI } from '@/utils/debug'

const api = axios.create({
  baseURL: 'https://api.dexscreener.com/latest/dex'
})

/**
 * Fetch token data from DexScreener
 */
export async function fetchTokenData(addresses: string[]) {
  debugAPI('Fetching DexScreener data for addresses: %o', addresses)
  const { data } = await api.get(`/tokens/${addresses.join(',')}`)
  return data
}