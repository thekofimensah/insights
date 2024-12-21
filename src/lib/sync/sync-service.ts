import { debugDB } from '../../utils/debug'
import { fetchCoinList, fetchMarketDataCoinList } from '../../services/api'
import { supabase } from '../../lib/db/client'
import type { CoinListItem } from '../../types/api'

interface MarketDataItem {
  symbol: string
  market_cap: number
  market_cap_rank: number
}

interface MarketData {
  market_cap: number;
  rank: number;
  current_price: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
}

export class SyncService {
  /**
   * Initialize database with coin data
   */
  static async initializeDatabase(): Promise<void> {
    try {
      debugDB('Starting database initialization')
      
      const { count, error: countError } = await supabase
        .from('coins')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        debugDB('Error checking database: %o', countError)
        throw countError
      }

      debugDB('Current coin count: %d', count)

      if (count && count > 0) {
        debugDB('Database already initialized with %d coins', count)
        return
      }

      debugDB('Fetching initial coin data')
      
      const basicList = await fetchCoinList()
      debugDB('Fetched basic list: %d coins', basicList.length)

      // Get first page of market data (top 250 coins by market cap)
      const marketData = await fetchMarketDataCoinList(1)
      debugDB('Fetched market data: %d coins', marketData.length)

      // Sort market data by market cap
      const sortedMarketData = marketData.sort((a, b) => 
        (b.market_cap || 0) - (a.market_cap || 0)
      )

      const marketCapMap = new Map<string, MarketData>(
        sortedMarketData.map(coin => [
          `${coin.symbol.toLowerCase()}_${coin.id}`,
          {
            market_cap: coin.market_cap,
            rank: coin.market_cap_rank,
            current_price: coin.current_price,
            total_volume: coin.total_volume,
            high_24h: coin.high_24h,
            low_24h: coin.low_24h,
            price_change_24h: coin.price_change_24h,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            ath: coin.ath,
            ath_date: coin.ath_date,
            atl: coin.atl,
            atl_date: coin.atl_date
          }
        ])
      )

      // Prepare coin data for insertion, prioritizing coins with market data
      const coins = basicList
        .map((coin) => ({
          id: coin.id,
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          contract_addresses: coin.platforms || {},
          market_cap: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.market_cap || null,
          rank: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.rank || null,
          current_price: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.current_price || null,
          total_volume: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.total_volume || null,
          high_24h: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.high_24h || null,
          low_24h: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.low_24h || null,
          price_change_24h: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.price_change_24h || null,
          price_change_percentage_24h: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.price_change_percentage_24h || null,
          ath: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.ath || null,
          ath_date: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.ath_date || null,
          atl: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.atl || null,
          atl_date: marketCapMap.get(`${coin.symbol.toLowerCase()}_${coin.id}`)?.atl_date || null,
          telegram: null,
          twitter: null,
          github: null,
          other_socials: null,
          last_updated: new Date().toISOString()
        }))
        .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))

      // Insert in batches of 100
      const BATCH_SIZE = 500
      debugDB('Inserting coins in batches of %d', BATCH_SIZE)

      for (let i = 0; i < coins.length; i += BATCH_SIZE) {
        const batch = coins.slice(i, i + BATCH_SIZE)
        debugDB('Inserting batch %d-%d of %d coins', i, i + batch.length, coins.length)

        const { error } = await supabase
          .from('coins')
          .insert(batch)
          .select()

        if (error) {
          debugDB('Error inserting batch: %o', error)
          throw error
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      debugDB('Successfully initialized database with %d coins', coins.length)
    } catch (error) {
      debugDB('Error in initializeDatabase: %o', error)
      throw error
    }
  }

  /**
   * Update coin ranks based on market cap
   */
  private static async updateRanks(): Promise<void> {
    try {
      debugDB('Updating coin ranks')
      
      const { data: coins, error } = await supabase
        .from('coins')
        .select('id, market_cap')
        .order('market_cap', { ascending: false })
        .not('market_cap', 'is', null)

      if (error) throw error

      // Update ranks in batches
      const batchSize = 100
      for (let i = 0; i < coins.length; i += batchSize) {
        const batch = coins.slice(i, i + batchSize)
        const updates = batch.map((coin, index) => ({
          id: coin.id,
          rank: i + index + 1,
        }))

        const { error: updateError } = await supabase
          .from('coins')
          .upsert(updates, {
            onConflict: 'id',
          })

        if (updateError) throw updateError
      }

      debugDB('Rank updates complete')
    } catch (error) {
      debugDB('Failed to update ranks: %o', error)
      throw error
    }
  }
}