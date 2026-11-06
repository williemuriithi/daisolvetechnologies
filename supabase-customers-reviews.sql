-- Daisolve: customer accounts + product reviews.
-- Run this once in Supabase: SQL Editor > New query > paste > Run.
--
-- Customers are stored in public.customers the moment they sign up (no email
-- verification). Passwords are bcrypt-hashed inside the database. The website
-- only talks to the functions at the bottom; the tables themselves are locked
-- (RLS on, no public policies), so nobody can read customers or hashes with
-- the public anon key. This is deliberately NOT Supabase Auth, so shoppers
-- never become "authenticated" users that could touch your admin policies.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  email         text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create unique index if not exists customers_email_key on public.customers (lower(email));

create table if not exists public.customer_sessions (
  token_hash  text primary key,
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '90 days'
);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  body        text not null check (char_length(body) between 5 and 1500),
  created_at  timestamptz not null default now(),
  unique (product_id, customer_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

alter table public.customers         enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.reviews           enable row level security;
-- No policies on purpose: only the security-definer functions below can touch them.
-- (Your dashboard / service role still sees everything.)

-- helper: token -> customer id (null if missing or expired)
create or replace function public._customer_from_token(p_token text)
returns uuid language sql security definer set search_path = public, extensions as $$
  select customer_id from public.customer_sessions
  where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and expires_at > now()
$$;

create or replace function public._new_session(p_customer uuid)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare t text := encode(gen_random_bytes(32), 'hex');
begin
  insert into public.customer_sessions (token_hash, customer_id)
  values (encode(digest(t, 'sha256'), 'hex'), p_customer);
  return t;
end $$;

create or replace function public.customer_signup(p_name text, p_phone text, p_email text, p_password text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare c public.customers;
begin
  p_name := btrim(coalesce(p_name, '')); p_phone := btrim(coalesce(p_phone, '')); p_email := lower(btrim(coalesce(p_email, '')));
  if char_length(p_name) < 2 then raise exception 'invalid_name'; end if;
  if char_length(regexp_replace(p_phone, '\D', '', 'g')) not between 9 and 15 then raise exception 'invalid_phone'; end if;
  if p_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'invalid_email'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'weak_password'; end if;
  if exists (select 1 from public.customers where lower(email) = p_email) then raise exception 'email_taken'; end if;

  insert into public.customers (name, phone, email, password_hash)
  values (p_name, p_phone, p_email, crypt(p_password, gen_salt('bf', 10)))
  returning * into c;

  return json_build_object('token', public._new_session(c.id),
    'customer', json_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email));
end $$;

-- p_login is an email or a phone number
create or replace function public.customer_login(p_login text, p_password text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare c public.customers; digits text;
begin
  p_login := lower(btrim(coalesce(p_login, '')));
  digits  := regexp_replace(p_login, '\D', '', 'g');
  select * into c from public.customers
   where lower(email) = p_login
      or (char_length(digits) >= 9 and right(regexp_replace(phone, '\D', '', 'g'), 9) = right(digits, 9))
   order by (lower(email) = p_login) desc limit 1;
  if not found then raise exception 'no_account'; end if;
  if c.password_hash <> crypt(coalesce(p_password, ''), c.password_hash) then raise exception 'bad_password'; end if;
  return json_build_object('token', public._new_session(c.id),
    'customer', json_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email));
end $$;

create or replace function public.customer_me(p_token text)
returns json language sql security definer set search_path = public, extensions as $$
  select json_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email)
  from public.customers c where c.id = public._customer_from_token(p_token)
$$;

create or replace function public.customer_logout(p_token text)
returns void language sql security definer set search_path = public, extensions as $$
  delete from public.customer_sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

-- one review per customer per product; submitting again replaces it
create or replace function public.submit_review(p_token text, p_product_id text, p_rating int, p_body text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := public._customer_from_token(p_token); cname text; r public.reviews;
begin
  if cid is null then raise exception 'not_signed_in'; end if;
  p_body := btrim(coalesce(p_body, ''));
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid_rating'; end if;
  if char_length(p_body) < 5 then raise exception 'review_too_short'; end if;
  if char_length(p_body) > 1500 then raise exception 'review_too_long'; end if;
  if coalesce(p_product_id, '') = '' then raise exception 'invalid_product'; end if;
  select name into cname from public.customers where id = cid;
  insert into public.reviews (product_id, customer_id, author_name, rating, body)
  values (p_product_id, cid, cname, p_rating, p_body)
  on conflict (product_id, customer_id)
  do update set rating = excluded.rating, body = excluded.body, author_name = excluded.author_name, created_at = now()
  returning * into r;
  return json_build_object('id', r.id);
end $$;

-- public read: only what the page needs (no customer ids)
create or replace function public.list_reviews(p_product_id text)
returns table (author_name text, rating int, body text, created_at timestamptz)
language sql security definer set search_path = public, extensions as $$
  select author_name, rating, body, created_at from public.reviews
  where product_id = p_product_id order by created_at desc limit 100
$$;

-- lock everything down, then open only the functions the website calls
revoke all on public.customers, public.customer_sessions, public.reviews from anon, authenticated;
revoke all on function public._customer_from_token(text), public._new_session(uuid) from public, anon, authenticated;
revoke all on function public.customer_signup(text,text,text,text), public.customer_login(text,text),
  public.customer_me(text), public.customer_logout(text), public.submit_review(text,text,int,text),
  public.list_reviews(text) from public;
grant execute on function public.customer_signup(text,text,text,text), public.customer_login(text,text),
  public.customer_me(text), public.customer_logout(text), public.submit_review(text,text,int,text),
  public.list_reviews(text) to anon, authenticated;
