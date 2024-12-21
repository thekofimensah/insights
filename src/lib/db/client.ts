//DELETE APPARANTLY


import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { debugDB } from '@/utils/debug'

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  const missing = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!supabaseKey) missing.push('VITE_SUPABASE_ANON_KEY')
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    'Please check your .env file.'
  )
}

debugDB('Initializing Supabase client with config:', {
  url: supabaseUrl,
  keyLength: supabaseKey.length,
})

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
)