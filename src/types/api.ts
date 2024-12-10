export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  market_cap?: number;
  platforms?: Record<string, string>;
}

export interface MarketDataCoinList {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  price_change_percentage_14d_in_currency: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_1y_in_currency: number;
  price_change_percentage_200d_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_7d_in_currency: number;
}
export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: 'id' | 'symbol' | 'name' | 'contract';
  market_cap?: number;
}

export interface DetailedCoinData {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  watchlist_portfolio_users: number;
  links: {
    homepage: string[];
    repos_url: {
      github?: string[];
    };
    subreddit_url: string;
    telegram_channel_identifier: string;
    twitter_screen_name: string;
    announcement_url: string[];
    chat_url: string[];
    whitepaper: string;
    official_forum_url: string[];
  };
  community_data: {
    twitter_followers: number;
    reddit_subscribers: number;
    telegram_channel_user_count: number | null;
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    ath: { usd: number };
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
  };
}