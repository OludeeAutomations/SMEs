-- Secure team invitations and shared workspace access.
begin;

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  member_user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text not null,
  role text not null check (role in ('Manager', 'Cashier', 'Storekeeper')),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'REVOKED')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

create unique index if not exists workspace_memberships_owner_email_idx
  on public.workspace_memberships (owner_user_id, lower(email))
  where status <> 'REVOKED';

create index if not exists workspace_memberships_member_idx
  on public.workspace_memberships (member_user_id, status, accepted_at desc);

alter table public.workspace_memberships enable row level security;
revoke all on public.workspace_memberships from anon;
grant select on public.workspace_memberships to authenticated;

drop policy if exists "Owners can view workspace memberships" on public.workspace_memberships;
create policy "Owners can view workspace memberships"
  on public.workspace_memberships for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists "Members can view their workspace membership" on public.workspace_memberships;
create policy "Members can view their workspace membership"
  on public.workspace_memberships for select to authenticated
  using ((select auth.uid()) = member_user_id and status = 'ACTIVE');

create or replace function public.can_access_business_workspace(target_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) = target_owner_id
    or exists (
      select 1
      from public.workspace_memberships membership
      where membership.owner_user_id = target_owner_id
        and membership.member_user_id = (select auth.uid())
        and membership.status = 'ACTIVE'
    );
$$;

revoke all on function public.can_access_business_workspace(uuid) from public;
grant execute on function public.can_access_business_workspace(uuid) to authenticated;

drop policy if exists "Users can read their workspace" on public.business_workspaces;
drop policy if exists "Workspace members can read their workspace" on public.business_workspaces;
create policy "Workspace members can read their workspace"
  on public.business_workspaces for select to authenticated
  using (public.can_access_business_workspace(user_id));

drop policy if exists "Users can update their workspace" on public.business_workspaces;
drop policy if exists "Workspace members can update their workspace" on public.business_workspaces;
create policy "Workspace members can update their workspace"
  on public.business_workspaces for update to authenticated
  using (public.can_access_business_workspace(user_id))
  with check (public.can_access_business_workspace(user_id));

commit;
