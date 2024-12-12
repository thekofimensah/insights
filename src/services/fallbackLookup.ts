import type { CoinListItem, DexScreenerResponse, DexScreenerPair } from '../types/api';
import { fetchDetailedCoinData } from './api/index';
import { fetchDexScreenerTokens } from './api/index';

class FallbackLookup {
  // Store fallback data in memory while app runs
  private readonly cache: Map<string, { 
    data: Partial<CoinListItem>; 
    timestamp: number 
  }> = new Map();

  // Main function to get missing data for a coin
  async lookupMissingData(coin: CoinListItem): Promise<CoinListItem> {
    if (this.hasRequiredData(coin)) {
      console.log(`${coin.id}: Already has required data`);
      return coin;
    }
    
    const [updatedCoin] = await this.lookupMissingDataBatch([coin]);
    return updatedCoin;
  }

  // Process multiple coins at once to reduce API calls
  async lookupMissingDataBatch(coins: CoinListItem[]): Promise<CoinListItem[]> {
    // Filter out coins that already have all required data
    const coinsNeedingData = coins.filter(coin => !this.hasRequiredData(coin));
    // Create a copy of the input array to store our results
    const results: CoinListItem[] = [...coins];
    // Process in batches of 30 (DexScreener's limit)
    const batchSize = 30;
    
    // Process each batch
    for (let i = 0; i < coinsNeedingData.length; i += batchSize) {
      const batch = coinsNeedingData.slice(i, i + batchSize);
      
      // Get addresses from all chains
      // First flatMap gets all addresses from all platforms
      // Then filter removes any null/undefined addresses
      const addresses = batch
        .flatMap(coin => 
          coin.platforms ? Object.values(coin.platforms) : []
        )
        .filter((addr): addr is string => !!addr);
      
      // Skip if no addresses found in this batch
      if (addresses.length === 0) continue;

      try {
        // Fetch market data for all addresses in this batch
        const dexData = await fetchDexScreenerTokens(addresses);
        
        // Update coins with new data from DexScreener
        dexData.pairs?.forEach((pair: DexScreenerPair) => {
          // Find the coin that matches this pair's address
          const coinIndex = results.findIndex(coin => 
            coin.platforms && 
            Object.values(coin.platforms).some(
              addr => addr?.toLowerCase() === pair.baseToken.address.toLowerCase()
            )
          );
          
          // If we found a matching coin, update its data
          if (coinIndex !== -1) {
            results[coinIndex] = {
              ...results[coinIndex],
              market_cap: pair.marketCap || results[coinIndex].market_cap || 0,
            };
            
            // Cache the updated data
            this.cache.set(results[coinIndex].id, {
              data: results[coinIndex],
              timestamp: Date.now()
            });
          }
        });
        
        // Add a small delay between batches to respect rate limits
        if (i + batchSize < coinsNeedingData.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Failed to fetch batch ${i}-${i + batchSize}:`, error);
      }
    }
    
    // Save all updates to localStorage
    await this.updateLocalStorage(results);
    return results;
  }

  // Update the coin in localStorage to persist changes
  private async updateLocalStorage(updatedCoins: CoinListItem[]): Promise<void> {
    try {
      const cached = localStorage.getItem('coinList');
      if (cached) {
        const { coins, lastUpdate } = JSON.parse(cached);
        
        // Update multiple coins
        updatedCoins.forEach(updatedCoin => {
          const coinIndex = coins.findIndex((coin: CoinListItem) => coin.id === updatedCoin.id);
          if (coinIndex !== -1) {
            coins[coinIndex] = {
              ...coins[coinIndex],
              ...updatedCoin
            };
          }
        });
        
        // Save back to localStorage
        localStorage.setItem('coinList', JSON.stringify({
          coins,
          lastUpdate
        }));
      }
    } catch (error) {
      console.error('Failed to update localStorage with fallback data:', error);
    }
  }

  // Check if a coin has all the data we need
  private hasRequiredData(coin: CoinListItem): boolean {
    return (
      typeof coin.market_cap === 'number' && 
      coin.market_cap > 0 &&
      !!coin.platforms &&
      Object.keys(coin.platforms).length > 0
    );
  }

  // Clear the memory cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Get stats about the cache (useful for debugging)
  getCacheStats(): { size: number; oldestEntry: number | null } {
    let oldestTimestamp: number | null = null;
    
    for (const entry of this.cache.values()) {
      if (!oldestTimestamp || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      oldestEntry: oldestTimestamp
    };
  }
}

// Create one instance to use everywhere in the app
export const fallbackLookup = new FallbackLookup(); 