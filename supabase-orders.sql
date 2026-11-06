-- Daisolve: orders + newsletter subscribers stored in the database, so every admin sees the same thing.
-- Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.
-- Needs the earlier script (supabase-customers-reviews.sql) to have been run first (it creates is_admin()).

create table if not exists public.orders (
  id         text primary key,
  created_at timestamptz not null default now(),
  data       jsonb not null,                       -- the full order exactly as the storefront built it
  status     text not null default 'pending' check (status in ('pending','dispatched','delivered','cancelled')),
  paid       boolean not null default false
);
create index if not exists orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

drop policy if exists orders_insert on public.orders;
drop policy if exists orders_admin  on public.orders;
-- anyone may place an order, but only as "pending / unpaid"; nobody but an admin can read or change orders
create policy orders_insert on public.orders for insert to anon, authenticated
  with check (status = 'pending' and paid = false and char_length(id) between 6 and 24 and jsonb_typeof(data) = 'object');
create policy orders_admin on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;

create table if not exists public.subscribers (
  email      text primary key,
  created_at timestamptz not null default now(),
  check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')
);
alter table public.subscribers enable row level security;
drop policy if exists subscribers_insert on public.subscribers;
drop policy if exists subscribers_admin  on public.subscribers;
create policy subscribers_insert on public.subscribers for insert to anon, authenticated with check (true);
create policy subscribers_admin  on public.subscribers for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert on public.subscribers to anon, authenticated;
grant select, update, delete on public.subscribers to authenticated;
