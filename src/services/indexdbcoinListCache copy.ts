import type { CoinListItem } from '../types/api';
import { fetchDetailedCoinData, fetchCoinList, fetchMarketDataCoinList } from './api/index';
import { openDatabase, saveToIndexedDB, getAllFromIndexedDB } from './indexDBHelper'; // IndexedDB helper functions

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
    return (
      this.coins.length === 0 || Date.now() - this.lastUpdate > this.CACHE_DURATION
    );
  }

  // Saves our coin list to IndexedDB
  private async saveCacheToIndexedDB(): Promise<void> {
    try {
      await saveToIndexedDB('coins', this.coins);
      const db = await openDatabase();
      const transaction = db.transaction('coins', 'readwrite');
      const store = transaction.objectStore('coins');
      store.put({ id: '__meta', lastUpdate: this.lastUpdate }); // Save metadata
      console.log('Cache saved to IndexedDB');
    } catch (error) {
      console.error('Failed to save cache to IndexedDB:', error);
    }
  }

  // Loads our saved coin list from IndexedDB
  private async loadCacheFromIndexedDB(): Promise<void> {
    try {
      const cachedCoins = await getAllFromIndexedDB('coins');
      const meta = cachedCoins.find((coin) => coin.id === '__meta');
      if (meta) {
        this.lastUpdate = meta.lastUpdate;
        this.coins = cachedCoins.filter((coin) => coin.id !== '__meta');
      }
      console.log('Cache loaded from IndexedDB:', this.coins.length, 'coins');
    } catch (error) {
      console.error('Failed to load cache from IndexedDB:', error);
    }
  }

  // Saves our coin list to browser storage as a fallback
  private saveCacheToLocalStorage(): void {
    try {
      localStorage.setItem('coinList', JSON.stringify({
        coins: this.coins,
        lastUpdate: this.lastUpdate,
      }));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  // Loads our saved coin list from browser storage as a fallback
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
    console.group('CoinListCache: getCoinList');
    console.log('Cache state:', {
      coinsCount: this.coins.length,
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      needsRefresh: this.shouldRefreshCache(),
    });

    if (this.shouldRefreshCache()) {
      try {
        console.log('Fetching fresh coin list...');
        // First, get basic info for ALL coins (includes platforms/contract addresses)
        const basicList = await fetchCoinList();
        console.log('Basic list fetched:', basicList.length, 'coins');

        // Then get market data for first 1500 coins (250 per page)
        const pagePromises = Array.from({ length: 1 }, async (_, i) => {
          await new Promise((resolve) => setTimeout(resolve, 1000 * i)); // 1 second delay between requests
          console.log(`Fetching market data for page ${i + 1}`);
          return fetchMarketDataCoinList(i + 1);
        });

        const allPagesData = await Promise.all(pagePromises);
        const marketData = allPagesData.flat();
        console.log('Market data fetched:', marketData.length, 'coins');

        // Create a lookup table of market caps by coin ID
        const marketCapMap = new Map(
          marketData.map((coin) => [coin.id, coin.market_cap])
        );

        // Combine basic info with market caps and platforms
        this.coins = basicList.map((coin) => ({
          id: coin.id,
          symbol: coin.symbol.toLowerCase(), // Normalize symbols to lowercase
          name: coin.name,
          market_cap: marketCapMap.get(coin.id) ?? 0,
          platforms: coin.platforms || {}, // Contract addresses by chain
        }));

        // Sort by market cap (highest first)
        this.coins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));

        this.lastUpdate = Date.now();
        await this.saveCacheToIndexedDB(); // Save to IndexedDB
        this.saveCacheToLocalStorage(); // Fallback to localStorage

        // Log some examples to verify the data structure
        console.log('Cache updated with', this.coins.length, 'coins');
        console.log('Sample entries:', {
          topCoin: this.coins[0],
          randomCoin: this.coins.find(
            (c) => c.platforms && Object.keys(c.platforms).length > 0
          ),
          lastUpdate: new Date(this.lastUpdate).toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch coin list:', error);
        await this.loadCacheFromIndexedDB(); // Fallback to IndexedDB if fetch fails
      }
    }
    console.groupEnd();
    return this.coins;
  }

  // Add this new method
  async findByAddress(address: string): Promise<CoinListItem | null> {
    const coins = await this.getCoinList();
    const normalizedAddress = address.toLowerCase();

    return (
      coins.find((coin) => {
        if (!coin.platforms) return false;

        // Check if the address exists in any platform
        return Object.values(coin.platforms).some(
          (contractAddress) =>
            contractAddress?.toLowerCase() === normalizedAddress
        );
      }) || null
    );
  }

  // New method to update market cap for a specific coin
  async updateCoinMarketCap(coinId: string): Promise<void> {
    try {
      // Get detailed data for the clicked coin
      const coinData = await fetchDetailedCoinData(coinId);
      const marketCap = coinData.market_data?.market_cap?.usd || 0;

      // Update the coin in our cache
      const coinIndex = this.coins.findIndex((coin) => coin.id === coinId);
      if (coinIndex !== -1) {
        this.coins[coinIndex].market_cap = marketCap;

        // Re-sort the list if market cap changed
        this.coins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));

        // Save to IndexedDB and localStorage
        await this.saveCacheToIndexedDB();
        this.saveCacheToLocalStorage();

        console.log(`Updated market cap for ${coinId}:`, marketCap);
      }
    } catch (error) {
      console.error(`Failed to update market cap for ${coinId}:`, error);
    }
  }
}

// Create one instance to use everywhere in the app
export const coinListCache = new CoinListCache();