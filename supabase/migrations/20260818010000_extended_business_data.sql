-- Mirror the remaining Ease workspace features into normal Supabase tables.
-- Incompatible pre-existing tables are preserved, never deleted.

do $$
declare
  target_table text;
  legacy_name text;
  suffix integer;
begin
  foreach target_table in array array[
    'profiles','businesses','branches','business_members','product_categories','expense_categories',
    'inventory_levels','inventory_movements','payments','projects','automation_rules',
    'ai_conversations','ai_messages','supplier_bills'
  ]
  loop
    if to_regclass(format('public.%I', target_table)) is null then continue; end if;

    if coalesce(obj_description(to_regclass(format('public.%I', target_table)), 'pg_class'), '') <> 'ease-managed-v1' then
      legacy_name := target_table || '_legacy_20260818_ext';
      suffix := 1;
      while to_regclass(format('public.%I', legacy_name)) is not null loop
        suffix := suffix + 1;
        legacy_name := target_table || '_legacy_20260818_ext_' || suffix;
      end loop;
      execute format('alter table public.%I rename to %I', target_table, legacy_name);
      raise notice 'Preserved public.% as public.%', target_table, legacy_name;
    end if;
  end loop;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', email text not null default '', updated_at timestamptz not null default now()
);
create table if not exists public.businesses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  id text not null, name text not null, category text not null default '', country text not null default '',
  currency text not null default 'NGN', logo_url text, updated_at timestamptz not null default now()
);
create table if not exists public.branches (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, business_id text not null,
  name text not null, country text not null default '', created_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.business_members (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, name text not null,
  email text not null, role text not null, created_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.product_categories (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, name text not null, primary key (user_id, id)
);
create table if not exists public.expense_categories (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, name text not null, primary key (user_id, id)
);
create table if not exists public.inventory_levels (
  user_id uuid not null references auth.users(id) on delete cascade, product_id text not null, quantity numeric not null default 0,
  low_stock_threshold numeric not null default 0, updated_at timestamptz not null default now(), primary key (user_id, product_id)
);
create table if not exists public.inventory_movements (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, product_id text not null,
  product_name text not null, quantity numeric not null, movement_type text not null,
  created_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.payments (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, source_type text not null,
  source_id text not null, customer_id text, amount numeric not null default 0, method text not null,
  status text not null, paid_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.projects (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, title text not null,
  completed boolean not null default false, created_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.automation_rules (
  user_id uuid not null references auth.users(id) on delete cascade, rule_key text not null,
  enabled boolean not null default false, updated_at timestamptz not null default now(), primary key (user_id, rule_key)
);
create table if not exists public.ai_conversations (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, title text not null,
  created_at timestamptz not null default now(), primary key (user_id, id)
);
create table if not exists public.ai_messages (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, conversation_id text not null,
  role text not null, content text not null, created_at timestamptz not null default now(),
  primary key (user_id, id), foreign key (user_id, conversation_id) references public.ai_conversations(user_id, id) on delete cascade
);
create table if not exists public.supplier_bills (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, supplier_id text not null,
  description text not null, amount numeric not null default 0, status text not null, due_date date,
  created_at timestamptz not null default now(), primary key (user_id, id)
);

do $$
declare target_table text;
begin
  foreach target_table in array array[
    'profiles','businesses','branches','business_members','product_categories','expense_categories',
    'inventory_levels','inventory_movements','payments','projects','automation_rules',
    'ai_conversations','ai_messages','supplier_bills'
  ] loop
    execute format('comment on table public.%I is %L', target_table, 'ease-managed-v1');
    execute format('alter table public.%I enable row level security', target_table);
    execute format('drop policy if exists "Users manage own rows" on public.%I', target_table);
    execute format('create policy "Users manage own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', target_table);
    execute format('revoke all on public.%I from anon', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;

create or replace function public.mirror_extended_business_workspace()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
declare
  record_json jsonb;
  value_text text;
  auth_email text;
  auth_name text;
  business_id text;
begin
  select coalesce(email, ''), coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
  into auth_email, auth_name from auth.users where id = new.user_id;
  business_id := coalesce(nullif(new.business->>'id', ''), new.user_id::text);

  insert into public.profiles values (new.user_id, auth_name, auth_email, new.updated_at)
  on conflict (user_id) do update set full_name=excluded.full_name, email=excluded.email, updated_at=excluded.updated_at;
  insert into public.businesses values (
    new.user_id, business_id, coalesce(nullif(new.business->>'name',''),'My business'),
    coalesce(new.business->>'category',''), coalesce(new.business->>'country',''),
    coalesce(nullif(new.business->>'currency',''),'NGN'), nullif(new.business->>'logoUrl',''), new.updated_at
  ) on conflict (user_id) do update set id=excluded.id, name=excluded.name, category=excluded.category,
    country=excluded.country, currency=excluded.currency, logo_url=excluded.logo_url, updated_at=excluded.updated_at;

  delete from public.ai_messages where user_id=new.user_id;
  delete from public.ai_conversations where user_id=new.user_id;
  delete from public.branches where user_id=new.user_id;
  delete from public.business_members where user_id=new.user_id;
  delete from public.product_categories where user_id=new.user_id;
  delete from public.expense_categories where user_id=new.user_id;
  delete from public.inventory_levels where user_id=new.user_id;
  delete from public.inventory_movements where user_id=new.user_id;
  delete from public.payments where user_id=new.user_id;
  delete from public.projects where user_id=new.user_id;
  delete from public.automation_rules where user_id=new.user_id;
  delete from public.supplier_bills where user_id=new.user_id;

  insert into public.branches values (
    new.user_id, 'primary', business_id, coalesce(nullif(new.business->>'branchName',''),'Primary branch'),
    coalesce(new.business->>'country',''), new.created_at
  );
  insert into public.business_members values (new.user_id, 'owner', auth_name, auth_email, 'Owner', new.created_at);
  for record_json in select value from jsonb_array_elements(coalesce(new.data->'teamMembers','[]'::jsonb)) loop
    insert into public.business_members values (
      new.user_id, record_json->>'id', record_json->>'name', record_json->>'email', record_json->>'role',
      coalesce((record_json->>'createdAt')::timestamptz, now())
    );
  end loop;

  for value_text in
    select distinct category from (
      select value as category from jsonb_array_elements_text(coalesce(new.data->'inventoryCategories','[]'::jsonb))
      union all select value->>'category' from jsonb_array_elements(coalesce(new.data->'products','[]'::jsonb))
    ) categories where nullif(category,'') is not null
  loop insert into public.product_categories values (new.user_id, md5(lower(value_text)), value_text); end loop;

  for value_text in
    select distinct category from (
      select value as category from jsonb_array_elements_text(coalesce(new.data->'expenseCategories','[]'::jsonb))
      union all select value->>'category' from jsonb_array_elements(coalesce(new.data->'expenses','[]'::jsonb))
    ) categories where nullif(category,'') is not null
  loop insert into public.expense_categories values (new.user_id, md5(lower(value_text)), value_text); end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'products','[]'::jsonb)) loop
    insert into public.inventory_levels values (
      new.user_id, record_json->>'id', coalesce((record_json->>'stockQuantity')::numeric,0),
      coalesce((record_json->>'lowStockThreshold')::numeric,0), new.updated_at
    );
  end loop;
  for record_json in select value from jsonb_array_elements(coalesce(new.data->'inventoryMovements','[]'::jsonb)) loop
    insert into public.inventory_movements values (
      new.user_id, record_json->>'id', record_json->>'productId', record_json->>'productName',
      coalesce((record_json->>'quantity')::numeric,0), record_json->>'type',
      coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'sales','[]'::jsonb)) loop
    insert into public.payments values (
      new.user_id, 'sale_'||(record_json->>'id'), 'SALE', record_json->>'id', nullif(record_json->>'customerId',''),
      coalesce((record_json->>'total')::numeric,0), coalesce(record_json->>'paymentMethod','CASH'), 'PAID',
      coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;
  for record_json in select value from jsonb_array_elements(coalesce(new.data->'invoices','[]'::jsonb)) where value->>'status'='PAID' loop
    insert into public.payments values (
      new.user_id, 'invoice_'||(record_json->>'id'), 'INVOICE', record_json->>'id', nullif(record_json->>'customerId',''),
      coalesce((record_json->>'total')::numeric,0), 'UNSPECIFIED', 'PAID', new.updated_at
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'projects','[]'::jsonb)) loop
    insert into public.projects values (
      new.user_id, record_json->>'id', record_json->>'title', coalesce((record_json->>'completed')::boolean,false),
      coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;
  for value_text, record_json in select key, value from jsonb_each(coalesce(new.data->'automations','{}'::jsonb)) loop
    insert into public.automation_rules values (new.user_id, value_text, coalesce(record_json::text::boolean,false), new.updated_at);
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'aiConversations','[]'::jsonb)) loop
    insert into public.ai_conversations values (
      new.user_id, record_json->>'id', record_json->>'title', coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;
  for record_json in select value from jsonb_array_elements(coalesce(new.data->'aiMessages','[]'::jsonb)) loop
    insert into public.ai_messages values (
      new.user_id, record_json->>'id', record_json->>'conversationId', record_json->>'role', record_json->>'content',
      coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'suppliers','[]'::jsonb)) where coalesce((value->>'outstandingBalance')::numeric,0)>0 loop
    insert into public.supplier_bills values (
      new.user_id, 'balance_'||(record_json->>'id'), record_json->>'id', 'Current outstanding balance',
      (record_json->>'outstandingBalance')::numeric, 'OPEN', null,
      coalesce((record_json->>'createdAt')::timestamptz,now())
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists mirror_extended_business_workspace_relations on public.business_workspaces;
create trigger mirror_extended_business_workspace_relations
after insert or update of business, data on public.business_workspaces
for each row execute function public.mirror_extended_business_workspace();

update public.business_workspaces set data=data;
