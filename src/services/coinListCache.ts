// import { fetchCoinList } from './api/index';
import type { CoinListItem } from '../types/api';
import { fetchDetailedCoinData, fetchCoinList, fetchMarketDataCoinList } from './api/index';

class CoinListCache {
  // List of all coins we know about
  private coins: CoinListItem[] = [];
  // When we last updated our list
  private lastUpdate: number = 0;
  // How long until we need fresh data (24 hours)
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  // Checks if we need new data
  // Returns true if:
  // 1. We have no coins yet
  // 2. Our data is older than 24 hours
  private shouldRefreshCache(): boolean {
    return this.coins.length === 0 || 
           Date.now() - this.lastUpdate > this.CACHE_DURATION;
  }

  // Saves our coin list to browser storage
  // So we don't lose it when the page refreshes
  private saveCacheToLocalStorage(): void {
    try {
      // this.checkCacheSize();
      localStorage.setItem('coinList', JSON.stringify({
        coins: this.coins,
        lastUpdate: this.lastUpdate
      }));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  // Loads our saved coin list from browser storage
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

  // Main function that gets us our list of coins. Can use this to search a coin 
  // Either returns cached data or fetches fresh data if needed
  async getCoinList(): Promise<CoinListItem[]> {
    console.group('CoinListCache: getCoinList Performance');
    const startTime = performance.now();

    console.log('Cache state:', {
      coinsCount: this.coins.length,
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      needsRefresh: this.shouldRefreshCache()
    });

    if (this.shouldRefreshCache()) {
      try {
        console.time('Total refresh duration');
        
        // Fetch basic list
        console.time('Basic list fetch');
        const basicList = await fetchCoinList();
        console.timeEnd('Basic list fetch');
        console.log('Basic list fetched:', basicList.length, 'coins');

        // Fetch market data
        console.time('Market data fetch');
        const pagePromises = Array.from({ length: 2 }, async (_, i) => {
          console.time(`Page ${i + 1} fetch`);
          console.log(`Fetching market data for page ${i + 1}`);
          const result = await fetchMarketDataCoinList(i + 1);
          console.timeEnd(`Page ${i + 1} fetch`);
          return result;
        });

        const allPagesData = await Promise.all(pagePromises);
        const marketData = allPagesData.flat();
        console.timeEnd('Market data fetch');
        console.log('Market data fetched:', marketData.length, 'coins');

        // Process data
        console.time('Data processing');
        const marketCapMap = new Map(
          marketData.map(coin => [coin.id, coin.market_cap])
        );

        this.coins = basicList.map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          market_cap: marketCapMap.get(coin.id) ?? 0,
          platforms: coin.platforms
     
        }));

        this.coins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        console.timeEnd('Data processing');

        // Save cache
        console.time('Cache save');
        this.lastUpdate = Date.now();
        this.saveCacheToLocalStorage();
        console.timeEnd('Cache save');
        
        console.log('Cache updated with', this.coins.length, 'coins');
        console.log('Sample entries:', {
          topCoin: this.coins[0],
          randomCoin: this.coins.find(c => c.platforms && c.platforms.length > 0),
          lastUpdate: new Date(this.lastUpdate).toISOString()
        });

        console.timeEnd('Total refresh duration');
      } catch (error) {
        console.error('Failed to fetch coin list:', error);
        console.time('Loading from localStorage');
        this.loadCacheFromLocalStorage();
        console.timeEnd('Loading from localStorage');
      }
    }

    const endTime = performance.now();
    console.log(`Total execution time: ${(endTime - startTime).toFixed(2)}ms`);
    console.groupEnd();
    return this.coins;
  }

  // Add this new method
  async findByAddress(address: string): Promise<CoinListItem | null> {
    const coins = await this.getCoinList();
    const normalizedAddress = address.toLowerCase();
    
    return coins.find(coin => {
      if (!coin.platforms) return false;
      
      // Check if the address exists in any platform
      return Object.values(coin.platforms).some(
        contractAddress => contractAddress?.toLowerCase() === normalizedAddress
      );
    }) || null;
  }

  // New method to update market cap for a specific coin
  async updateCoinMarketCap(coinId: string): Promise<void> {
    try {
      // Get detailed data for the clicked coin
      const coinData = await fetchDetailedCoinData(coinId);
      const marketCap = coinData.market_data?.market_cap?.usd || 0;

      // Update the coin in our cache
      const coinIndex = this.coins.findIndex(coin => coin.id === coinId);
      if (coinIndex !== -1) {
        this.coins[coinIndex].market_cap = marketCap;
        
        // Re-sort the list if market cap changed
        this.coins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        
        // Save to localStorage
        this.saveCacheToLocalStorage();
        
        console.log(`Updated market cap for ${coinId}:`, marketCap);
      }
    } catch (error) {
      console.error(`Failed to update market cap for ${coinId}:`, error);
    }
  }

  // private checkCacheSize(): void {
  //   try {
  //     const cache = JSON.stringify({
  //       coins: this.coins,
  //       lastUpdate: this.lastUpdate
  //     });
      
  //     const sizeInBytes = new Blob([cache]).size;
  //     const totalSpace = 5 * 1024 * 1024; // Roughly 5MB (common localStorage limit)
  //     const usedSpace = cache.length;
  //     const percentUsed = ((sizeInBytes / totalSpace) * 100).toFixed(2);

  //     console.group('Cache Size Check');
  //     console.log('Cache size:', (sizeInBytes / 1024 / 1024).toFixed(2), 'MB');
  //     console.log('Total coins cached:', this.coins.length);
  //     console.log('Average bytes per coin:', (sizeInBytes / this.coins.length).toFixed(2));
  //     console.log(`Storage used: ${percentUsed}% of available space`);
  //     console.groupEnd();
  //   } catch (error) {
  //     console.error('Failed to check cache size:', error);
  //   }
  // }
}



// Create one instance to use everywhere in the app
export const coinListCache = new CoinListCache();