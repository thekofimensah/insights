import { supabase } from '../client'
import type { Database } from '../../../types/supabase'

type Coin = Database['public']['Tables']['coins']['Row']

export const coinQueries = {
  /**
   * Get a coin by its ID
   */
  async getById(id: string | number) {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Coin
  },

  /**
   * Get a coin by its symbol
   */
  async getBySymbol(symbol: string) {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .eq('symbol', symbol.toLowerCase())
      .single()
    
    if (error) throw error
    return data as Coin
  },

  /**
   * Get multiple coins by their IDs
   */
  async getByIds(ids: (string | number)[]) {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .in('id', ids)
    
    if (error) throw error
    return data as Coin[]
  }
}