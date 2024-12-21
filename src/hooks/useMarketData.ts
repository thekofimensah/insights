import { useEffect, useState } from 'react';
import { coinListCache } from '../services/coinListCache.ts';
import { fetchDexScreenerTokens } from '../services/api/index.ts';
import type { CoinListItem } from '../types/api.ts';

export function useMarketData(coinId: string | null) {
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!coinId) return;

    const fetchMarketCap = async () => {
      setIsLoading(true);
      try {
        // First check cache
        const coins = await coinListCache.getCoinList();
        const cachedCoin = coins.find(coin => coin.id === coinId);

        if (cachedCoin?.market_cap) {
          setMarketCap(cachedCoin.market_cap);
          return;
        }

        // If not in cache, try DexScreener
        if (cachedCoin?.platforms) {
          const addresses = Object.values(cachedCoin.platforms).filter(Boolean);
          if (addresses.length > 0) {
            const dexData = await fetchDexScreenerTokens(addresses);
            if (dexData.pairs && dexData.pairs.length > 0) {
              const newMarketCap = dexData.pairs[0].marketCap;
              if (newMarketCap) {
                // Update cache
                await updateCoinCache(coinId, newMarketCap);
                setMarketCap(newMarketCap);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching market cap:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketCap();
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchMarketCap, 30000);
    return () => clearInterval(intervalId);
  }, [coinId]);

  return { marketCap, isLoading };
}

async function updateCoinCache(coinId: string, marketCap: number): Promise<void> {
  const coins = await coinListCache.getCoinList();
  const coinIndex = coins.findIndex(c => c.id === coinId);
  
  if (coinIndex !== -1) {
    const updatedCoin: CoinListItem = {
      ...coins[coinIndex],
      market_cap: marketCap
    };
    coins[coinIndex] = updatedCoin;
    await coinListCache.saveCacheToLocalStorage();
  }
}