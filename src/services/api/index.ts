import { fetcher } from './fetcher';
import { endpoints } from './endpoints';
import type { MarketDataCoinList, CoinListItem, DetailedCoinData } from '../../types/api';

export async function fetchCoinList(): Promise<CoinListItem[]> {
  return await fetcher<CoinListItem[]>(endpoints.coinList);
}

export async function fetchDetailedCoinData(id: string): Promise<DetailedCoinData> {
  return await fetcher<DetailedCoinData>(endpoints.coinData(id));
}

// This could be good to pull in large amounts of coins and their MC, rather than needing to go one by one
export async function fetchMarketDataCoinList(page: number): Promise<MarketDataCoinList[]> {
  const url = `${endpoints.coinMarkets}?page=${page}`;
  return await fetcher<MarketDataCoinList[]>(url);
}
// {
//   "id": "bitcoin",
//   "symbol": "btc",
//   "name": "Bitcoin",
//   "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
//   "current_price": 97457,
//   "market_cap": 1930121837685,
//   "market_cap_rank": 1,
//   "fully_diluted_valuation": 2047865006439,
//   "total_volume": 157363435098,
//   "high_24h": 100288,
//   "low_24h": 94726,
//   "price_change_24h": -1597.2255856021948,
//   "price_change_percentage_24h": -1.61247,
//   "market_cap_change_24h": -32444527135.85498,
//   "market_cap_change_percentage_24h": -1.65317,
//   "circulating_supply": 19792593,
//   "total_supply": 21000000,
//   "max_supply": 21000000,
//   "ath": 103679,
//   "ath_change_percentage": -5.9394,
//   "ath_date": "2024-12-05T03:10:51.885Z",
//   "atl": 67.81,
//   "atl_change_percentage": 143717.11247,
//   "atl_date": "2013-07-06T00:00:00.000Z",
//   "roi": null,
//   "last_updated": "2024-12-10T07:01:51.649Z",
//   "price_change_percentage_14d_in_currency": 2.899916643796684,
//   "price_change_percentage_1h_in_currency": 0.6081335103788416,
//   "price_change_percentage_1y_in_currency": 121.9098625014484,
//   "price_change_percentage_200d_in_currency": 44.840233967730406,
//   "price_change_percentage_24h_in_currency": -1.6124709556756316,
//   "price_change_percentage_30d_in_currency": 23.438429364346188,
//   "price_change_percentage_7d_in_currency": 1.3249033561030898
// }
// ]

export * from './errors';