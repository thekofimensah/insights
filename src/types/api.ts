export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  market_cap?: number;
  platforms?: Record<string, string>;
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