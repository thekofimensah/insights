import { coinListCache } from './coinListCache';
import type { CoinListItem } from '../types/api';

class ContractAddressCache {
  private addressMap: Map<string, CoinListItem> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async updateCache(): Promise<void> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
      );
      const coins = await response.json();
      
      this.addressMap.clear();
      coins.forEach((coin: any) => {
        if (coin.platforms) {
          Object.entries(coin.platforms).forEach(([chain, address]) => {
            if (address && typeof address === 'string') {
              this.addressMap.set(address.toLowerCase(), {
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name
              });
            }
          });
        }
      });
      
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Failed to update contract address cache:', error);
      this.loadFromLocalStorage();
    }
  }

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
    if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
      await this.updateCache();
    }
    return this.addressMap.get(address.toLowerCase());
  }
}

export const contractAddressCache = new ContractAddressCache();