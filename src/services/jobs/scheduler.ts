import { debugJobs } from '@/utils/debug'
import { fetchCoinMarketData } from '@/lib/api'
import { updateCoin } from '@/lib/supabase'

export class JobScheduler {
  private jobs: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Schedule a job to update coin data
   */
  scheduleUpdate(coinId: string, interval: number) {
    debugJobs('Scheduling update for coin: %s', coinId)
    
    // Clear existing job if any
    this.clearJob(coinId)

    // Create new job
    const job = setInterval(async () => {
      try {
        const data = await fetchCoinMarketData(coinId)
        await updateCoin(coinId, {
          market_cap: data.market_data?.market_cap?.usd || null,
          last_updated: new Date().toISOString()
        })
        debugJobs('Updated data for coin: %s', coinId)
      } catch (error) {
        debugJobs('Failed to update coin %s: %o', coinId, error)
      }
    }, interval)

    this.jobs.set(coinId, job)
  }

  /**
   * Clear a scheduled job
   */
  clearJob(coinId: string) {
    const job = this.jobs.get(coinId)
    if (job) {
      clearInterval(job)
      this.jobs.delete(coinId)
      debugJobs('Cleared job for coin: %s', coinId)
    }
  }

  /**
   * Clear all scheduled jobs
   */
  clearAll() {
    this.jobs.forEach((job) => clearInterval(job))
    this.jobs.clear()
    debugJobs('Cleared all jobs')
  }
}