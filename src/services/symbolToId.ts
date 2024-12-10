import type { CoinListItem } from '../types/api';

class SymbolResolver {
  private symbolToIdMap: Map<string, CoinListItem> = new Map();

  updateMap(coins: CoinListItem[]): void {
    this.symbolToIdMap.clear();
    for (const coin of coins) {
      this.symbolToIdMap.set(coin.symbol.toLowerCase(), coin);
    }
  }

  findBySymbol(symbol: string): CoinListItem | undefined {
    return this.symbolToIdMap.get(symbol.toLowerCase());
  }
}

export const symbolResolver = new SymbolResolver();