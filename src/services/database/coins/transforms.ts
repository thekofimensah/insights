import type { DetailedCoinData } from '@/types/api';
import type { CoinUpdate } from './types';

export function transformCoinData(data: DetailedCoinData): CoinUpdate {
  return {
    market_cap: data.market_data?.market_cap?.usd || null,
    telegram: data.links?.telegram_channel_identifier || null,
    twitter: data.links?.twitter_screen_name || null,
    github: data.links?.repos_url?.github?.[0] || null,
    other_socials: {
      reddit: data.links?.subreddit_url || null,
      homepage: data.links?.homepage?.[0] || null,
      whitepaper: data.links?.whitepaper || null,
    },
  };
}