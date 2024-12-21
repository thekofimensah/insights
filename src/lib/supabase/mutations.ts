import { supabase } from './client'
import type { Database } from '@/types/supabase'
import { debugDB } from '@/utils/debug'

type CoinUpdate = Database['public']['Tables']['coins']['Update']

/**
 * Update a coin's data
 */
export async function updateCoin(id: string, data: CoinUpdate): Promise<void> {
  debugDB('Updating coin %s with data: %o', id, data)
  const { error } = await supabase
    .from('coins')
    .update({
      ...data,
      last_updated: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}