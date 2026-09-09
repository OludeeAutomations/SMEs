-- Repair legacy auth signup triggers that still insert into profiles.id.
-- Rekoda's managed profiles table uses user_id as its primary key.
begin;

do $$
declare
  profile_trigger record;
begin
  for profile_trigger in
    select trigger_row.tgname
    from pg_trigger as trigger_row
    join pg_proc as function_row on function_row.oid = trigger_row.tgfoid
    where trigger_row.tgrelid = 'auth.users'::regclass
      and not trigger_row.tgisinternal
      and pg_get_functiondef(function_row.oid) ~* 'insert[[:space:]]+into[[:space:]]+(public[.])?profiles'
  loop
    execute format('drop trigger %I on auth.users', profile_trigger.tgname);
  end loop;
end;
$$;

create or replace function public.rekoda_create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, email, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    now()
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = excluded.updated_at;

  return new;
end;
$$;

drop trigger if exists rekoda_create_profile_after_signup on auth.users;
create trigger rekoda_create_profile_after_signup
after insert on auth.users
for each row execute function public.rekoda_create_user_profile();

commit;
