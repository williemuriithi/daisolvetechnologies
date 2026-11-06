-- Daisolve: customer accounts (Supabase Auth), product reviews, and admin lock-down.
-- Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.
--
-- * Shoppers sign up with Supabase Auth. They appear under Authentication > Users the
--   moment they sign up, and a copy lands in the public.profiles table (Table Editor).
--   If "Confirm email" is on (Authentication > Providers > Email) they must click the
--   link in their email before they can sign in. That is fine; nothing else is needed.
-- * Reviews are saved in public.reviews. Only signed-in shoppers can post, one per
--   product, and only as themselves.
-- * Only the two admin emails below can add/edit/delete products, articles and images.
--   This matters now: shoppers are "authenticated" users too, so the old "any signed-in
--   user" rules are replaced.

-- ---------------------------------------------------------------- clean up the earlier version
drop function if exists public.customer_signup(text,text,text,text), public.customer_login(text,text),
  public.customer_me(text), public.customer_logout(text), public.submit_review(text,text,int,text),
  public.list_reviews(text), public._customer_from_token(text), public._new_session(uuid);
drop table if exists public.reviews, public.customer_sessions, public.customers cascade;

-- ---------------------------------------------------------------- admin check
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('trustchoice254@gmail.com', 'wilfredmuriithi8@gmail.com')
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- profiles (one row per shopper)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, email)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'phone', new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- people who already signed up (e.g. admins) get a profile row too
insert into public.profiles (id, name, phone, email)
select id, raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'phone', email from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------- reviews
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default 'Customer',
  rating      int  not null check (rating between 1 and 5),
  body        text not null check (char_length(body) between 5 and 1500),
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id, created_at desc);
alter table public.reviews enable row level security;

-- the author name always comes from the shopper's profile, never from the browser
create or replace function public.reviews_set_author() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  new.author_name := coalesce((select nullif(btrim(name), '') from public.profiles where id = new.user_id), 'Customer');
  return new;
end $$;
create trigger reviews_set_author before insert or update on public.reviews
  for each row execute function public.reviews_set_author();

create policy reviews_read   on public.reviews for select to anon, authenticated using (true);
create policy reviews_insert on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy reviews_update on public.reviews for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reviews_delete on public.reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- lock admin-only data to the two emails
do $$
declare r record;
begin
  -- remove every old policy on products and articles (they allowed any signed-in user)
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('products', 'articles') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
  -- ...and on the product-images storage bucket
  for r in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects'
             and (coalesce(qual, '') like '%product-images%' or coalesce(with_check, '') like '%product-images%') loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;

  if to_regclass('public.products') is not null then
    alter table public.products enable row level security;
    create policy products_read  on public.products for select to anon, authenticated using (true);
    create policy products_admin on public.products for all    to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
  if to_regclass('public.articles') is not null then
    alter table public.articles enable row level security;
    create policy articles_read  on public.articles for select to anon, authenticated using (published = true or public.is_admin());
    create policy articles_admin on public.articles for all    to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

create policy product_images_read  on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy product_images_admin on storage.objects for all    to authenticated
  using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());

-- table privileges (Supabase normally grants these by default; stated here so it is explicit)
grant select on public.reviews  to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select on public.profiles to authenticated;
