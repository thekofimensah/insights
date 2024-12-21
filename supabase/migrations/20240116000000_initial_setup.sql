-- Drop existing tables if they exist
drop table if exists public.social_streams cascade;
drop table if exists public.coins cascade;

-- Create coins table with essential fields
create table if not exists public.coins (
  -- Basic info
  id text primary key,                    -- CoinGecko ID (e.g., 'bitcoin')
  symbol text not null,                   -- Trading symbol (e.g., 'btc')
  name text not null,                     -- Display name (e.g., 'Bitcoin')
  contract_addresses jsonb,                 -- Smart contract addresses by chain
  
  -- Market data
  market_cap numeric,                      -- Current market cap in USD
  rank integer,                           -- Market cap rank
  current_price numeric,
  total_volume numeric,
  high_24h numeric,
  low_24h numeric,
  price_change_24h numeric,
  price_change_percentage_24h numeric,
  ath numeric,
  ath_date timestamp with time zone,
  atl numeric,
  atl_date timestamp with time zone,
  
  -- Social info
  telegram text,                          -- Telegram channel
  twitter text,                           -- Twitter handle
  github text,                           -- GitHub repository
  other_socials jsonb,                   -- Other social media links
  last_updated timestamp with time zone not null default now(),

  -- Constraints
  constraint symbol_length check (char_length(symbol) <= 100),
  constraint name_length check (char_length(name) <= 100)
);

-- Create a GIN index for fast JSONB searching
CREATE INDEX idx_coins_contract_addresses ON coins USING GIN (contract_addresses);

-- Create social streams table for real-time data
create table if not exists public.social_streams (
  -- Basic info
  id bigint generated by default as identity primary key,
  coin_id text references public.coins(id) on delete cascade,
  source text not null check (source in ('telegram', 'twitter')),
  message text not null,
  timestamp timestamp with time zone not null default now(),
  user_role text,

  -- Constraints
  constraint message_length check (char_length(message) <= 2000),
  constraint user_role_length check (char_length(user_role) <= 50)
);

-- Create indexes for common queries
create index if not exists coins_symbol_idx on public.coins (symbol);
create index if not exists coins_rank_idx on public.coins (rank);
create index if not exists coins_market_cap_idx on public.coins (market_cap);

create index if not exists social_streams_coin_id_idx on public.social_streams (coin_id);
create index if not exists social_streams_source_idx on public.social_streams (source);
create index if not exists social_streams_timestamp_idx on public.social_streams (timestamp desc);
create index if not exists social_streams_coin_source_time_idx 
  on public.social_streams (coin_id, source, timestamp desc);

-- Temporarily disable RLS for initial data load
alter table public.coins disable row level security;
alter table public.social_streams disable row level security;
  