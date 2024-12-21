import { JobScheduler } from './scheduler';

export class CronService {
  private scheduler: JobScheduler;
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    this.scheduler = new JobScheduler();
  }

  start(): void {
    // Update top 500 coins every 5 minutes
    this.intervals.push(
      setInterval(() => {
        this.scheduler.scheduleBatchUpdate(1, 250);
      }, 5 * 60 * 1000)
    );

    // Initial update
    this.scheduler.scheduleBatchUpdate(1, 250);
  }

  stop(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.scheduler.destroy();
  }

  async enrichCoin(coinId: string): Promise<void> {
    await this.scheduler.enrichCoin(coinId);
  }
}

// Create singleton instance
export const cronService = new CronService();