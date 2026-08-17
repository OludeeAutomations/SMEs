-- Tracks provider checkout links without exposing secret keys to the mobile app.
create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id text not null,
  provider text not null check (provider in ('Paystack', 'Flutterwave')),
  reference text not null unique,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null,
  customer_email text not null,
  checkout_url text,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'FAILED')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payment_requests enable row level security;

drop policy if exists "Users can read their payment requests" on public.payment_requests;
create policy "Users can read their payment requests" on public.payment_requests
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.payment_requests from anon;
grant select on public.payment_requests to authenticated;

create index if not exists payment_requests_user_invoice_idx
  on public.payment_requests(user_id, invoice_id, created_at desc);
