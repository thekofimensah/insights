import { BaseCache } from './base-cache';
import { getTopCoins, enrichCoinData, type Coin } from '@/services/database/coins';

export class CoinCache extends BaseCache<Coin> {
  async getCoinList(): Promise<Coin[]> {
    if (this.shouldRefreshCache()) {
      try {
        const coins = await getTopCoins(this.options.limit);
        this.updateCache(coins);
      } catch (error) {
        console.error('Failed to fetch coin list:', error);
        if (this.state.data.length === 0) {
          throw error;
        }
      }
    }
    return this.state.data;
  }

  async findByAddress(address: string): Promise<Coin | null> {
    const coins = await this.getCoinList();
    const normalizedAddress = address.toLowerCase();
    
    return coins.find(coin => {
      const addresses = coin.contract_address as Record<string, string>;
      if (!addresses) return false;
      
      return Object.values(addresses).some(
        addr => addr?.toLowerCase() === normalizedAddress
      );
    }) || null;
  }

  async enrichCoin(coinId: string): Promise<void> {
    await enrichCoinData(coinId);
    this.invalidateCache();
  }
}

export const coinCache = new CoinCache();