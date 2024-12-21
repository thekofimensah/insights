import type { CacheState, CacheOptions } from './types';

export abstract class BaseCache<T> {
  protected state: CacheState<T>;
  protected options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.state = {
      data: [],
      lastUpdate: 0,
    };
    
    this.options = {
      duration: options.duration ?? 5 * 60 * 1000, // 5 minutes
      limit: options.limit ?? 500,
    };
  }

  protected shouldRefreshCache(): boolean {
    return this.state.data.length === 0 || 
           Date.now() - this.state.lastUpdate > this.options.duration;
  }

  protected updateCache(data: T[]): void {
    this.state.data = data;
    this.state.lastUpdate = Date.now();
  }

  protected invalidateCache(): void {
    this.state.lastUpdate = 0;
  }
}