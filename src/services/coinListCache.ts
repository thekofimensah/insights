import { fetchCoinList } from './api';
import type { CoinListItem } from '../types/api';
import { fetchMarketDataCoinList } from './api.ts';

class CoinListCache {
  private coins: CoinListItem[] = [];
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private shouldRefreshCache(): boolean {
    return this.coins.length === 0 || 
           Date.now() - this.lastUpdate > this.CACHE_DURATION;
  }

  private saveCacheToLocalStorage(): void {
    try {
      localStorage.setItem('coinList', JSON.stringify({
        coins: this.coins,
        lastUpdate: this.lastUpdate
      }));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private loadCacheFromLocalStorage(): void {
    try {
      const cached = localStorage.getItem('coinList');
      if (cached) {
        const { coins, lastUpdate } = JSON.parse(cached);
        this.coins = coins;
        this.lastUpdate = lastUpdate;
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  async getCoinList(): Promise<CoinListItem[]> {
    console.group('CoinListCache: getCoinList');
    console.log('Cache state:', {
      coinsCount: this.coins.length,
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      needsRefresh: this.shouldRefreshCache()
    });

    if (this.shouldRefreshCache()) {
      try {
        console.log('Fetching fresh coin list...');
        // Fetch basic coin list
        const basicList = await fetchCoinList();
        console.log('Basic list fetched:', basicList.length, 'coins');

        // Fetch market data for pages with delay
        const pagePromises = Array.from({ length: 6 }, async (_, i) => {
          await new Promise(resolve => setTimeout(resolve, 2000 * i)); // 1 second delay between each request
          console.log(`Fetching market data for page ${i + 1}`);
          return fetchMarketDataCoinList(i + 1);
        });

        const allPagesData = await Promise.all(pagePromises);
        console.log('Market data fetched:', allPagesData.flat().length, 'coins');

        const coinNames = allPagesData.flat().map(coin => coin.name);
        console.log('Fetched coin names:', coinNames);

        // Flatten all pages and create market cap map
        const marketCapMap = new Map(
          allPagesData.flat().map((coin: any) => [coin.id, coin.market_cap])
        );

        // Merge market cap data with basic list
        this.coins = basicList.map(coin => ({
          ...coin,
          market_cap: marketCapMap.get(coin.id) ?? 0
        }));

        this.lastUpdate = Date.now();
        this.saveCacheToLocalStorage();
        console.log('Cache updated with', this.coins.length, 'coins');
        console.log('New cache state:', {
          coinsCount: this.coins.length,
          sampleDoc1: this.coins[0],
          sampleDoc2: this.coins.find(coin => coin.id === "kaia"),
          lastUpdate: new Date(this.lastUpdate).toISOString(),
          needsRefresh: this.shouldRefreshCache()
        });
      } catch (error) {
        console.error('Failed to fetch coin list:', error);
        this.loadCacheFromLocalStorage();
      }
    }
    console.groupEnd();
    return this.coins;
  }
}

export const coinListCache = new CoinListCache();