export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const endpoints = {
  coinList: `${COINGECKO_BASE_URL}/coins/list`,
  coinMarkets: `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250`,
  coinData: (id: string) => `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`,
} as const;