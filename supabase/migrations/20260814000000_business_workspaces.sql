-- Ease cloud workspace. Run with `supabase db push` or paste into the Supabase SQL editor.
create table if not exists public.business_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_workspaces enable row level security;

drop policy if exists "Users can read their workspace" on public.business_workspaces;
create policy "Users can read their workspace" on public.business_workspaces
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their workspace" on public.business_workspaces;
create policy "Users can create their workspace" on public.business_workspaces
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their workspace" on public.business_workspaces;
create policy "Users can update their workspace" on public.business_workspaces
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their workspace" on public.business_workspaces;
create policy "Users can delete their workspace" on public.business_workspaces
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.business_workspaces from anon;
grant select, insert, update, delete on public.business_workspaces to authenticated;

create index if not exists business_workspaces_updated_at_idx on public.business_workspaces(updated_at desc);
