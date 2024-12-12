import { fetchDetailedCoinData } from './api/index';
import type { CoinListItem } from '../types/api';

class DataEnhancer {
  // This method finds coins in our cache that are missing important data
  // (market cap or platform addresses)
  private static async getMissingDataEntries(): Promise<CoinListItem[]> {
    console.group('DataEnhancer: getMissingDataEntries');
    try {
      // Get our cached coin list from localStorage
      const cached = localStorage.getItem('coinList');
      if (!cached) {
        console.log('No cached data found.');
        console.groupEnd();
        return [];
      }

      const { coins } = JSON.parse(cached);
      // Filter out coins that are missing either market_cap or platforms
      const missingEntries = coins.filter((coin: CoinListItem) => !coin.market_cap || !coin.platforms);
      console.log('Missing data entries found:', missingEntries.length);
      console.groupEnd();
      return missingEntries;
    } catch (error) {
      console.error('Failed to get missing entries:', error);
      console.groupEnd();
      return [];
    }
  }

  // This method updates a single coin's data in localStorage
  // Used when we get fresh data for a coin
  private static async updateCoinInStorage(updatedCoin: CoinListItem): Promise<void> {
    console.group(`DataEnhancer: updateCoinInStorage for ${updatedCoin.id}`);
    try {
      const cached = localStorage.getItem('coinList');
      if (!cached) {
        console.log('No cached data found.');
        console.groupEnd();
        return;
      }

      const { coins, lastUpdate } = JSON.parse(cached);
      // Find the coin we want to update
      const coinIndex = coins.findIndex((coin: CoinListItem) => coin.id === updatedCoin.id);
      
      if (coinIndex !== -1) {
        // Update the coin with new data while keeping existing data
        coins[coinIndex] = {
          ...coins[coinIndex],
          ...updatedCoin
        };

        // Save the updated list back to localStorage
        localStorage.setItem('coinList', JSON.stringify({ coins, lastUpdate }));
        console.log(`Updated storage data for ${updatedCoin.id}`);
      } else {
        console.log(`Coin ${updatedCoin.id} not found in cache.`);
      }
    } catch (error) {
      console.error('Failed to update coin in storage:', error);
    }
    console.groupEnd();
  }

  // Main method that finds and fixes missing data in our cache
  public static async enhanceMissingData(): Promise<void> {
    console.group('DataEnhancer: enhanceMissingData');
    try {
      console.log('Checking for missing data...');
      // Get list of coins missing data
      const missingEntries = await this.getMissingDataEntries();

      console.log('Found entries to enhance:', missingEntries.length);
      // For each coin with missing data...
      for (const coin of missingEntries) {
        console.group(`Enhancing coin: ${coin.name} (${coin.id})`);
        try {
          // Fetch detailed data from API
          const detailedData = await fetchDetailedCoinData(coin.id);
          // Create enhanced version of coin with missing data filled in
          const enhancedCoin: CoinListItem = {
            ...coin,
            market_cap: detailedData.market_data?.market_cap?.usd || 0,
            platforms: detailedData.platforms || {}
          };

          console.log(`Enhanced coin: ${coin.name} (${coin.id})`);
          // Save enhanced coin data to storage
          await this.updateCoinInStorage(enhancedCoin);
        } catch (error) {
          console.error(`Failed to enhance coin ${coin.id}:`, error);
        }
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to enhance missing data:', error);
    }
    console.groupEnd();
  }

  // Method to update a specific coin's data
  // Used when user clicks on a coin and we want fresh data
  public static async updateCoinData(coinId: string): Promise<CoinListItem | null> {
    console.group(`DataEnhancer: updateCoinData for ${coinId}`);
    try {
      console.log(`Fetching detailed data for coin: ${coinId}`);
      const detailedData = await fetchDetailedCoinData(coinId);

      // Create updated coin object with fresh data
      const updatedCoin: CoinListItem = {
        id: coinId,
        symbol: detailedData.symbol.toLowerCase(),
        name: detailedData.name,
        market_cap: detailedData.market_data?.market_cap?.usd || 0,
        platforms: detailedData.platforms || {}
      };

      // Save to storage and return updated data
      await this.updateCoinInStorage(updatedCoin);
      console.log(`Updated data for coin: ${updatedCoin.name} (${updatedCoin.id})`);
      console.groupEnd();
      return updatedCoin;
    } catch (error) {
      console.error(`Failed to update data for coin ${coinId}:`, error);
      console.groupEnd();
      return null;
    }
  }
}

export default DataEnhancer;