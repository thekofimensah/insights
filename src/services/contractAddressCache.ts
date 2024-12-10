import { coinListCache } from './coinListCache';
import type { CoinListItem } from '../types/api';

class ContractAddressCache {
  private addressMap: Map<string, CoinListItem> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async updateCache(): Promise<void> {
    console.group('ContractAddressCache: updateCache');
    try {
      console.log('Fetching contract addresses...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
      );
      const coins = await response.json();
      console.log('Fetched', coins.length, 'coins with platform data');
      
      this.addressMap.clear();
      let addressCount = 0;
      coins.forEach((coin: any) => {
        if (coin.platforms) {
          Object.entries(coin.platforms).forEach(([chain, address]) => {
            if (address && typeof address === 'string') {
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
      
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
      console.log('Cache updated with', addressCount, 'contract addresses');
    } catch (error) {
      console.error('Failed to update contract address cache:', error);
      this.loadFromLocalStorage();
    }
    console.groupEnd();
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('', JSON.stringify({
        addresses: Array.from(this.addressMap.entries()),
        lastUpdate: this.lastUpdate
      }));
    } catch (error) {
      console.error('Failed to save contract address cache:', error);
    }
  }

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

  async findByAddress(address: string): Promise<CoinListItem | undefined> {
    console.group('ContractAddressCache: findByAddress');
    console.log('Searching for address:', address);
    
    if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
      console.log('Cache expired, updating...');
      await this.updateCache();
    }
    
    const result = this.addressMap.get(address.toLowerCase());
    console.log('Search result:', result || 'Not found');
    console.groupEnd();
    return result;
  }
}

export const contractAddressCache = new ContractAddressCache();