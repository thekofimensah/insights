import { useApi } from './useApi';
import { fetchDetailedCoinData } from '../services/api/index';
import type { MarketData } from '../types';
import type { DetailedCoinData } from '../types/api';
import { coinListCache } from '../services/coinListCache';
import { useEffect } from 'react';

function calculateDevScore(devData: DetailedCoinData['developer_data']): number {
  const metrics = {
    forks: normalize(devData?.forks ?? 0, 0, 50000),
    stars: normalize(devData?.stars ?? 0, 0, 100000),
    issues: normalize(devData?.closed_issues ?? 0 / (devData?.total_issues || 1), 0, 1),
    prs: normalize(devData?.pull_requests_merged ?? 0, 0, 10000),
    contributors: normalize(devData?.pull_request_contributors ?? 0, 0, 1000)
  };

  return Math.round(
    (metrics.forks * 0.2 + 
     metrics.stars * 0.3 + 
     metrics.issues * 0.2 + 
     metrics.prs * 0.15 + 
     metrics.contributors * 0.15) * 100
  );
}

function calculateSocialScore(communityData: DetailedCoinData['community_data']): number {
  const metrics = {
    twitter: normalize(communityData?.twitter_followers ?? 0, 0, 5000000),
    reddit: normalize(communityData?.reddit_subscribers ?? 0, 0, 5000000),
    telegram: normalize(communityData?.telegram_channel_user_count ?? 0, 0, 500000)
  };

  return Math.round(
    (metrics.twitter * 0.4 + 
     metrics.reddit * 0.4 + 
     metrics.telegram * 0.2) * 100
  );
}

function normalize(value: number, min: number, max: number): number {
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

function transformCoinData(response: DetailedCoinData): MarketData {
  const devScore = calculateDevScore(response.developer_data);
  const sentimentScore = response.sentiment_votes_up_percentage ?? 50;
  const socialScore = calculateSocialScore(response.community_data);
  const ath_multiplier = Math.floor(response.market_data.ath.usd / response.market_data.current_price.usd);

  const contractAddresses = Object.entries(response.platforms || {})
    .map(([chain, address]) => ({
      chain,
      address: typeof address === 'string' ? address : ''
    }))
    .filter(item => item.address);

  return {
    raw_data: response.id,
    name: response.name,
    marketCap: response.market_data.market_cap.usd,
    price: response.market_data.current_price.usd,
    tvl: response.market_data.total_volume.usd,
    ath_usd: response.market_data.ath.usd,
    ath_multiplier,
    contractAddresses,
    trustScore: Math.round((devScore + socialScore) / 2),
    sentimentScore,
    debug: {
      socialData: {
        twitter: {
          handle: response.links?.twitter_screen_name || null,
          followers: response.community_data?.twitter_followers || 0
        },
        telegram: response.links?.telegram_channel_identifier || null,
        reddit: response.links?.subreddit_url || null,
        watchlist: response.watchlist_portfolio_users,
        homepage: response.links?.homepage?.[0] || null,
        github: response.links?.repos_url?.github?.[0] || null,
        whitepaper: response.links?.whitepaper || null
      },
      marketData: response.market_data
    }
  };
}

export function useCoinData(coinId: string | null) {
  const { data: rawData, error, isLoading, refetch } = useApi(
    ['coin', coinId || ''],
    () => (coinId ? fetchDetailedCoinData(coinId) : Promise.reject('No coin ID')),
    {
      enabled: !!coinId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  // Subscribe to cache updates
  useEffect(() => {
    if (!coinId) return;

    const checkCacheAndUpdate = async () => {
      const coins = await coinListCache.getCoinList();
      const cachedCoin = coins.find(coin => coin.id === coinId);
      
      if (cachedCoin && cachedCoin.market_cap && (!rawData || cachedCoin.market_cap !== rawData.market_data.market_cap.usd)) {
        refetch();
      }
    };

    // Check immediately
    checkCacheAndUpdate();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkCacheAndUpdate, 5000);

    return () => clearInterval(intervalId);
  }, [coinId, rawData, refetch]);

  const data = rawData ? transformCoinData(rawData) : null;

  return { data, error, isLoading };
}