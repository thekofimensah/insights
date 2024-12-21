import type { Database } from '@/types/supabase'

export type Tables = Database['public']['Tables']
export type Coin = Tables['coins']['Row']
export type CoinInsert = Tables['coins']['Insert']
export type CoinUpdate = Tables['coins']['Update']
export type SocialStream = Tables['social_streams']['Row']