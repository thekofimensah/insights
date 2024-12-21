import { supabase } from './client'
import type { Database } from '@/types/supabase'
import { debugDB } from '@/utils/debug'

type Coin = Database['public']['Tables']['coins']['Row']

/**
 * Get top coins by market cap
 */
export async function getTopCoins(limit = 500): Promise<Coin[]> {
  debugDB('Fetching top %d coins', limit)
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('market_cap', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get a single coin by ID
 */
export async function getCoinById(id: string): Promise<Coin | null> {
  debugDB('Fetching coin by ID: %s', id)
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .eq('symbol', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Search coins by contract address across any chain
 */
export async function searchByContractAddress(address: string): Promise<Coin[]> {
  debugDB('Searching for contract address: %s', address)
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .raw(`contract_addresses::jsonb @> ANY(ARRAY(
      SELECT json_build_object(key, ?::text)::jsonb 
      FROM jsonb_object_keys(contract_addresses) key
    ))`, [address.toLowerCase()])
    .limit(10)

  if (error) throw error
  return data
}

/**
 * Enhanced search that includes contract addresses
 */
export async function searchCoins(query: string, limit = 10): Promise<Coin[]> {
  debugDB('Searching coins with query: %s', query)
  
  // If query looks like an address, search contract addresses
  if (query.length >= 40) {
    return searchByContractAddress(query)
  }

  // Otherwise search by name/symbol
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
    .order('market_cap', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}