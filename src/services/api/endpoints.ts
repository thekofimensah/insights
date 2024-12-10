export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const endpoints = {
  coinList: `${COINGECKO_BASE_URL}/coins/list`,
  coinMarkets: (page: number) => 
    `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y&order=market_cap_desc&per_page=250&page=${page}`,
  coinData: (id: string) => 
    `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`,
} as const;