export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      coins: {
        Row: {
          current_price: number
          id: string
          symbol: string
          name: string
          contract_address: Json
          market_cap: number | null
          rank: number | null
          last_updated: string
          telegram: string | null
          twitter: string | null
          github: string | null
          other_socials: Json | null
          total_volume: number | null
          high_24h: number | null
          low_24h: number | null
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          ath: number | null
          ath_date: string | null
          atl: number | null
          atl_date: string | null
        }
        Insert: {
          id: string
          symbol: string
          name: string
          contract_address?: Json
          market_cap?: number | null
          rank?: number | null
          last_updated?: string
          telegram?: string | null
          twitter?: string | null
          github?: string | null
          other_socials?: Json | null
          total_volume?: number | null
          high_24h?: number | null
          low_24h?: number | null
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          ath?: number | null
          ath_date?: string | null
          atl?: number | null
          atl_date?: string | null
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          contract_address?: Json
          market_cap?: number | null
          rank?: number | null
          last_updated?: string
          telegram?: string | null
          twitter?: string | null
          github?: string | null
          other_socials?: Json | null
          total_volume?: number | null
          high_24h?: number | null
          low_24h?: number | null
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          ath?: number | null
          ath_date?: string | null
          atl?: number | null
          atl_date?: string | null
        }
      }
      social_streams: {
        Row: {
          id: number
          coin_id: string
          source: string
          message: string
          timestamp: string
          user_role: string | null
        }
        Insert: {
          id?: number
          coin_id: string
          source: string
          message: string
          timestamp: string
          user_role?: string | null
        }
        Update: {
          id?: number
          coin_id?: string
          source?: string
          message?: string
          timestamp?: string
          user_role?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}