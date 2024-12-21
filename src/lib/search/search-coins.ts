import { debugDB } from '@/utils/debug'
import { getCoinList } from '@/services/coinListCache'
import type { CoinListItem } from '@/types/api'
import { coinQueries } from '../supabase/queries/coins'

/**
 * Search coins by name or symbol
 * @param query Search query
 * @param limit Maximum number of results
 * @returns Array of matching coins
 */
export async function searchCoins(query: string, limit = 10): Promise<CoinListItem[]> {
  debugDB('Searching coins with query: %s', query)
  
  // Get cached coin list
  const coins = await getCoinList()
  
  // Normalize query
  const normalizedQuery = query.toLowerCase()
  
  // Filter coins by name or symbol
  const results = coins
    .filter(coin => 
      coin.name.toLowerCase().includes(normalizedQuery) ||
      coin.symbol.toLowerCase().includes(normalizedQuery)
    )
    // Sort by market cap (highest first)
    .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
    // Limit results
    .slice(0, limit)

  debugDB('Found %d results for query: %s', results.length, query)
  return results
}