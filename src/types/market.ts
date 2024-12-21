export interface MarketData {
  name: string
  marketCap: number
  price: number
  tvl: number
  trustScore: number
  sentimentScore: number
  ath_multiplier: number
  ath_usd: number
  raw_data: string
  contractAddresses: Array<{
    chain: string
    address: string
  }>
  debug: {
    socialData: {
      twitter: {
        handle: string | null
        followers: number
      }
      telegram: string | null
      reddit: string | null
      watchlist: number
      homepage: string | null
      github: string | null
      whitepaper: string | null
    }
    marketData: any
  }
}