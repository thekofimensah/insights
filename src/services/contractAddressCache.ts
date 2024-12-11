import { coinListCache } from './coinListCache';
import type { CoinListItem } from '../types/api';

class ContractAddressCache {
  // Stores coin info by their contract address (like a dictionary)
  private addressMap: Map<string, CoinListItem> = new Map();
  // Remembers when we last updated our data
  private lastUpdate: number = 0;
  // How long before we need fresh data (24 hours)
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  // Gets fresh contract addresses for all coins
  async updateCache(): Promise<void> {
    console.group('ContractAddressCache: updateCache');
    try {
      console.log('Fetching contract addresses...');
      // Get list of all coins with their contract addresses
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
      );
      const coins = await response.json();
      
      // Clear old data
      this.addressMap.clear();
      let addressCount = 0;

      // For each coin, save its contract addresses
      // Example: Bitcoin on Ethereum has address 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
      coins.forEach((coin: any) => {
        if (coin.platforms) {
          Object.entries(coin.platforms).forEach(([chain, address]) => {
            if (address && typeof address === 'string') {
              // Save the coin info with its contract address as the key
              this.addressMap.set(address.toLowerCase(), {
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name
              });
              addressCount++;
            }
          });
        }
      });
      
      // Remember when we updated and save to browser storage
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
      console.log('Cache updated with', addressCount, 'contract addresses');
    } catch (error) {
      console.error('Failed to update contract address cache:', error);
      // If update fails, use old data from browser storage
      this.loadFromLocalStorage();
    }
    console.groupEnd();
  }

  // Saves our address data to browser storage so we don't lose it
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('contractAddressCache', JSON.stringify({
        addresses: Array.from(this.addressMap.entries()),
        lastUpdate: this.lastUpdate
      }));
    } catch (error) {
      console.error('Failed to save contract address cache:', error);
    }
  }

  // Loads saved address data from browser storage
  private loadFromLocalStorage(): void {
    try {
      const cached = localStorage.getItem('contractAddressCache');
      if (cached) {
        const { addresses, lastUpdate } = JSON.parse(cached);
        this.addressMap = new Map(addresses);
        this.lastUpdate = lastUpdate;
      }
    } catch (error) {
      console.error('Failed to load contract address cache:', error);
    }
  }

  // Looks up a coin by its contract address
  // Example: "What coin is 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599?"
  async findByAddress(address: string): Promise<CoinListItem | undefined> {
    console.group('ContractAddressCache: findByAddress');
    console.log('Searching for address:', address);
    
    // If our data is old, get fresh data
    if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
      console.log('Cache expired, updating...');
      await this.updateCache();
    }
    
    // Look up the coin by its address
    const result = this.addressMap.get(address.toLowerCase());
    console.log('Search result:', result || 'Not found');
    console.groupEnd();
    return result;
  }
}

// Create one instance to use everywhere in the app
export const contractAddressCache = new ContractAddressCache();