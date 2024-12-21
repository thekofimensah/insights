import type { Coin } from '@/services/database/coins';

export interface JobResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface CoinEnrichmentJob {
  type: 'enrich-coin';
  coinId: string;
}

export interface BatchUpdateJob {
  type: 'batch-update';
  startRank: number;
  limit: number;
}

export type Job = CoinEnrichmentJob | BatchUpdateJob;

export interface WorkerMessage {
  id: string;
  job: Job;
  timestamp: number;
}