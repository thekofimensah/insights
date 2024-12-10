import { fetcher } from './fetcher';
import { endpoints } from './endpoints';
import type { CoinListItem, DetailedCoinData } from '../../types/api';

export async function fetchCoinList(): Promise<CoinListItem[]> {
  return await fetcher<CoinListItem[]>(endpoints.coinList);
}

export async function fetchDetailedCoinData(id: string): Promise<DetailedCoinData> {
  return await fetcher<DetailedCoinData>(endpoints.coinData(id));
}

export async function fetchTopMarketCapCoins(limit: number = 250): Promise<CoinListItem[]> {
  const url = `${endpoints.coinMarkets}?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`;
  return await fetcher<CoinListItem[]>(url);
}

export * from './errors';