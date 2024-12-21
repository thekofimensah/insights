import type { Coin } from '@/services/database/coins';

export interface CacheState<T> {
  data: T[];
  lastUpdate: number;
}

export interface CacheOptions {
  duration?: number;
  limit?: number;
}