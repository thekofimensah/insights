import type { Database } from '@/types/supabase';

export type Coin = Database['public']['Tables']['coins']['Row'];
export type CoinInsert = Database['public']['Tables']['coins']['Insert'];
export type CoinUpdate = Database['public']['Tables']['coins']['Update'];