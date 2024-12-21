//DELETE APPARANTLY

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { debugDB } from '../utils/debug';

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file.'
  );
}

debugDB('Initializing Supabase client with URL: %s', supabaseUrl);

// Create and export the typed client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log successful initialization
debugDB('Supabase client initialized successfully');