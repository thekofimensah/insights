import { debugCache } from '@/utils/debug'
import type { CoinListItem } from '@/types/api'
import { fetchCoinList, fetchMarketDataCoinList } from './api'

class CoinListCache {
  private coins: CoinListItem[] = []
  private lastUpdate: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private shouldRefreshCache(): boolean {
    return (
      this.coins.length === 0 || 
      Date.now() - this.lastUpdate > this.CACHE_DURATION
    )
  }

  async getCoinList(): Promise<CoinListItem[]> {
    debugCache('Getting coin list from cache')
    
    if (this.shouldRefreshCache()) {
      debugCache('Cache needs refresh')
      try {
        // Fetch basic list with contract addresses
        const basicList = await fetchCoinList()
        debugCache('Fetched basic list: %d coins', basicList.length)

        // Fetch market data for top coins
        const marketData = await fetchMarketDataCoinList(1)
        debugCache('Fetched market data: %d coins', marketData.length)

        // Create market cap lookup
        const marketCapMap = new Map(
          marketData.map(coin => [coin.id, coin.market_cap])
        )

        // Combine data
        this.coins = basicList.map(coin => ({
          ...coin,
          market_cap: marketCapMap.get(coin.id) || 0
        }))

        // Sort by market cap
        this.coins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
        
        this.lastUpdate = Date.now()
        debugCache('Cache updated with %d coins', this.coins.length)
      } catch (error) {
        debugCache('Failed to update cache: %o', error)
        // If fetch fails and we have no data, rethrow
        if (this.coins.length === 0) throw error
      }
    }

    return this.coins
  }
}

// Export singleton instance
export const coinListCache = new CoinListCache()

// Export helper function
export const getCoinList = () => coinListCache.getCoinList()