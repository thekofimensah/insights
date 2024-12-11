import { fetcher } from './fetcher';
import { endpoints } from './endpoints';
import type { MarketDataCoinList, CoinListItem, DetailedCoinData } from '../../types/api';

// Gets a basic list of all coins (just id, name, symbol)
export async function fetchCoinList(): Promise<CoinListItem[]> {
  return await fetcher<CoinListItem[]>(endpoints.coinList);
  // Sample response:
  // [
  //   {
  //     "id": "0chain",
  //     "symbol": "zcn",
  //     "name": "Zus",
  //     "platforms": {
  //       "ethereum": "0xb9ef770b6a5e12e45983c5d80545258aa38f3b78",
  //       "polygon-pos": "0x8bb30e0e67b11b978a5040144c410e1ccddcba30"
  //     }
  //   }
  // ]
}

// Gets detailed info about one specific coin (like Bitcoin)
export async function fetchDetailedCoinData(id: string): Promise<DetailedCoinData> {
  const data = await fetcher<DetailedCoinData>(endpoints.coinData(id));
  
  // Extract contract addresses from platforms
  const contractAddresses = Object.entries(data.platforms || {}).map(([chain, address]) => ({
    chain,
    address
  }));

  // Extract relevant USD-only market data
  const marketData = {
    current_price_usd: data.market_data?.current_price?.usd,
    market_cap_usd: data.market_data?.market_cap?.usd,
    total_volume_usd: data.market_data?.total_volume?.usd,
    ath_usd: data.market_data?.ath?.usd,
    name: data.id,
    contractAddresses
  };

  // Extract social and community data
  const socialData = {
    twitter_handle: data.links?.twitter_screen_name,
    telegram_channel: data.links?.telegram_channel_identifier,
    subreddit_url: data.links?.subreddit_url,
    official_forum: data.links?.official_forum_url?.[0],
    whitepaper: data.links?.whitepaper,
    watchlist_users: data.watchlist_portfolio_users,
    sentiment_votes_up: data.sentiment_votes_up_percentage,
    sentiment_votes_down: data.sentiment_votes_down_percentage,
  };

  // Debug output in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Detailed Coin Data');
    console.log('Market Data:', marketData);
    console.log('Social Data:', socialData);
    console.log('Raw Response:', data);
    console.groupEnd();
  }

  return data;
}

// Gets a page of coins with their market data (price, market cap, etc.)
// Each page has 250 coins, page 1 = first 250 coins, page 2 = next 250, etc.
export async function fetchMarketDataCoinList(page: number): Promise<MarketDataCoinList[]> {
  const data = await fetcher<MarketDataCoinList[]>(endpoints.coinMarkets(page));

  // Debug output in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Market Data Coin List');
    console.log(`Page ${page} data:`, data.slice(0, 3));
    console.log(`Total coins on page ${page}:`, data.length);
    console.groupEnd();
  }

  return data;
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