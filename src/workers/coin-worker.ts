import { fetchMarketDataCoinList, fetchDetailedCoinData } from '@/services/api';
import { updateCoin, type Coin } from '@/services/database/coins';
import type { JobResult, Job } from './types';

async function enrichCoin(coinId: string): Promise<JobResult> {
  try {
    const data = await fetchDetailedCoinData(coinId);
    await updateCoin(coinId, {
      market_cap: data.market_data?.market_cap?.usd || null,
      telegram: data.links?.telegram_channel_identifier || null,
      twitter: data.links?.twitter_screen_name || null,
      github: data.links?.repos_url?.github?.[0] || null,
      other_socials: {
        reddit: data.links?.subreddit_url || null,
        homepage: data.links?.homepage?.[0] || null,
        whitepaper: data.links?.whitepaper || null,
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function batchUpdate(startRank: number, limit: number): Promise<JobResult> {
  try {
    const coins = await fetchMarketDataCoinList(Math.ceil(startRank / 250));
    const updates: Promise<void>[] = [];

    for (const coin of coins) {
      if (coin.market_cap_rank >= startRank && coin.market_cap_rank < startRank + limit) {
        updates.push(
          updateCoin(coin.id, {
            market_cap: coin.market_cap,
            rank: coin.market_cap_rank,
          })
        );
      }
    }

    await Promise.all(updates);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

self.onmessage = async (event: MessageEvent<Job>) => {
  const { type, ...params } = event.data;
  let result: JobResult;

  switch (type) {
    case 'enrich-coin':
      result = await enrichCoin(params.coinId);
      break;
    case 'batch-update':
      result = await batchUpdate(params.startRank, params.limit);
      break;
    default:
      result = { success: false, error: 'Unknown job type' };
  }

  self.postMessage(result);
};