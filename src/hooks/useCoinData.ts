import { useQuery } from '@tanstack/react-query'
import { coinQueries } from '../lib/supabase/queries/coins'
import type { MarketData } from '../types'
import { debugDB } from '../utils/debug'

export function useCoinData(coinId: string | null) {
  return useQuery({
    queryKey: ['coin', coinId],
    queryFn: async (): Promise<MarketData | null> => {
      if (!coinId) return null
      
      debugDB('Fetching coin data for: %s', coinId)
      try {
        const data = await coinQueries.getById(coinId)
        
        if (!data) {
          debugDB('No data found for coin: %s', coinId)
          return null
        }

        debugDB('Successfully fetched data for coin: %s', coinId)
        
        // Transform database data to MarketData type
        return {
          name: data.name,
          marketCap: data.market_cap || 0,
          price: data.current_price || 0,
          tvl: data.total_volume || 0, // Using total_volume as TVL for now
          trustScore: 0, // TODO: Add trust score calculation
          sentimentScore: 0, // TODO: Add sentiment calculation
          ath_multiplier: data.ath ? (data.current_price || 0) / data.ath : 0,
          ath_usd: data.ath || 0,
          raw_data: data.id,
          contractAddresses: data.contract_address ? Object.entries(data.contract_address).map(([chain, address]) => ({
            chain,
            address: address as string
          })) : [],
          debug: {
            socialData: {
              twitter: {
                handle: data.twitter,
                followers: 0, // TODO: Add Twitter followers
              },
              telegram: data.telegram,
              reddit: data.other_socials?.reddit || null,
              watchlist: 0,
              homepage: data.other_socials?.homepage || null,
              github: data.github,
              whitepaper: data.other_socials?.whitepaper || null,
            },
            marketData: {
              ...data,
              price_change_24h: data.price_change_24h || 0,
              price_change_percentage_24h: data.price_change_percentage_24h || 0,
              high_24h: data.high_24h || 0,
              low_24h: data.low_24h || 0,
            },
          },
        }
      } catch (error) {
        debugDB('Error in useCoinData: %o', error)
        throw error
      }
    },
    enabled: !!coinId,
  })
}