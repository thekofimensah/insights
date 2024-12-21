export const API_KEY = 'CG-peU4FUU92pAYpWYHQJ5hZ5xN';
export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const endpoints = {
  coinList: `${COINGECKO_BASE_URL}/coins/list?include_platform=true&x_cg_demo_api_key=${API_KEY}`,
  coinMarkets: (page: number) => 
    `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y&order=market_cap_desc&per_page=250&page=${page}&x_cg_demo_api_key=${API_KEY}`,
  coinData: (id: string) => 
    `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true&x_cg_demo_api_key=${API_KEY}`,
  dexScreener: (addresses: string[]) => 
    `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(',')}`,
} as const;