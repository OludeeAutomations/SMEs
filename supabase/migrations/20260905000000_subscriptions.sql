-- Stores Rekoda plan entitlements. Trial creation runs on the database clock so
-- a client cannot choose or repeatedly extend its own trial dates.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'PRO_MONTHLY' check (plan in ('PRO_MONTHLY')),
  status text not null default 'TRIALING' check (status in ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED')),
  currency text not null default 'NGN',
  price_kobo integer not null default 500000 check (price_kobo > 0),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  provider text,
  provider_customer_code text,
  provider_subscription_code text,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read their subscription" on public.subscriptions;
create policy "Users can read their subscription" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.subscriptions from anon;
revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;

create or replace function public.start_rekoda_trial()
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  requesting_user uuid := auth.uid();
  subscription_row public.subscriptions;
begin
  if requesting_user is null then
    raise exception 'Authentication required';
  end if;

  insert into public.subscriptions (
    user_id, plan, status, currency, price_kobo, trial_started_at, trial_ends_at
  ) values (
    requesting_user, 'PRO_MONTHLY', 'TRIALING', 'NGN', 500000, now(), now() + interval '30 days'
  ) on conflict (user_id) do nothing;

  select * into subscription_row
  from public.subscriptions
  where user_id = requesting_user;

  return subscription_row;
end;
$$;

revoke all on function public.start_rekoda_trial() from public, anon;
grant execute on function public.start_rekoda_trial() to authenticated;

create index if not exists subscriptions_status_ends_idx
  on public.subscriptions(status, trial_ends_at, current_period_ends_at);
