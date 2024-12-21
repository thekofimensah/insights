let's d-- Seed initial data
insert into public.coins (id, symbol, name, rank)
values 
  ('bitcoin', 'btc', 'Bitcoin', 1),
  ('ethereum', 'eth', 'Ethereum', 2)
on conflict (id) do nothing;