-- Expose the app's workspace data as normal relational tables.
-- The app keeps business_workspaces as its offline-friendly aggregate and this
-- trigger atomically mirrors every cloud save into queryable rows.

-- Preserve manually-created/older tables whose shape is incompatible with
-- this app. PostgreSQL's CREATE TABLE IF NOT EXISTS does not add missing
-- columns, which otherwise makes the RLS policies below fail.
do $$
declare
  target_table text;
  required_columns jsonb;
  legacy_name text;
  is_compatible boolean;
begin
  for target_table, required_columns in
    select key, value from jsonb_each(jsonb_build_object(
      'business_profiles', jsonb_build_array('user_id', 'id', 'name', 'category', 'country', 'currency', 'branch_name', 'logo_url', 'updated_at'),
      'products', jsonb_build_array('user_id', 'id', 'name', 'category', 'image_url', 'cost_price', 'selling_price', 'stock_quantity', 'low_stock_threshold', 'supplier_id', 'created_at'),
      'customers', jsonb_build_array('user_id', 'id', 'full_name', 'phone_number', 'email_address', 'address', 'notes', 'total_bought', 'amount_owed', 'created_at'),
      'sales', jsonb_build_array('user_id', 'id', 'customer_id', 'customer_name', 'subtotal', 'total', 'payment_method', 'notes', 'created_at'),
      'sale_items', jsonb_build_array('user_id', 'sale_id', 'line_index', 'product_id', 'product_name', 'quantity', 'price'),
      'invoices', jsonb_build_array('user_id', 'id', 'customer_id', 'customer_name', 'total', 'status', 'due_date', 'terms', 'created_at'),
      'invoice_items', jsonb_build_array('user_id', 'invoice_id', 'line_index', 'product_id', 'product_name', 'quantity', 'price'),
      'expenses', jsonb_build_array('user_id', 'id', 'amount', 'category', 'description', 'merchant', 'expense_date', 'is_recurring', 'created_at'),
      'suppliers', jsonb_build_array('user_id', 'id', 'name', 'phone_number', 'email_address', 'address', 'outstanding_balance', 'created_at')
    ))
  loop
    if to_regclass(format('public.%I', target_table)) is null then
      continue;
    end if;

    select bool_and(exists (
      select 1
      from information_schema.columns as existing_column
      where existing_column.table_schema = 'public'
        and existing_column.table_name = target_table
        and existing_column.column_name = required.required_name
    ))
    into is_compatible
    from jsonb_array_elements_text(required_columns) as required(required_name);

    if not coalesce(is_compatible, false) then
      legacy_name := target_table || '_legacy_20260818';
      if to_regclass(format('public.%I', legacy_name)) is not null then
        raise exception 'Cannot preserve incompatible table %. The backup name % already exists. Rename one of them and run this migration again.', target_table, legacy_name;
      end if;
      execute format('alter table public.%I rename to %I', target_table, legacy_name);
      raise notice 'Preserved incompatible table public.% as public.%', target_table, legacy_name;
    end if;
  end loop;
end $$;

create table if not exists public.business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  category text not null default '',
  country text not null default '',
  currency text not null default 'NGN',
  branch_name text not null default '',
  logo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  category text not null default '',
  image_url text,
  cost_price numeric not null default 0,
  selling_price numeric not null default 0,
  stock_quantity numeric not null default 0,
  low_stock_threshold numeric not null default 0,
  supplier_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.customers (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  full_name text not null,
  phone_number text not null default '',
  email_address text,
  address text,
  notes text,
  total_bought numeric not null default 0,
  amount_owed numeric not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.sales (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  customer_id text,
  customer_name text,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null,
  notes text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.sale_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_id text not null,
  line_index integer not null,
  product_id text not null,
  product_name text not null,
  quantity numeric not null default 0,
  price numeric not null default 0,
  primary key (user_id, sale_id, line_index),
  foreign key (user_id, sale_id) references public.sales(user_id, id) on delete cascade
);

create table if not exists public.invoices (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  customer_id text not null,
  customer_name text not null,
  total numeric not null default 0,
  status text not null,
  due_date date not null,
  terms text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.invoice_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id text not null,
  line_index integer not null,
  product_id text not null,
  product_name text not null,
  quantity numeric not null default 0,
  price numeric not null default 0,
  primary key (user_id, invoice_id, line_index),
  foreign key (user_id, invoice_id) references public.invoices(user_id, id) on delete cascade
);

create table if not exists public.expenses (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  amount numeric not null default 0,
  category text not null,
  description text not null,
  merchant text,
  expense_date date not null,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.suppliers (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  phone_number text not null default '',
  email_address text,
  address text,
  outstanding_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_profiles', 'products', 'customers', 'sales', 'sale_items',
    'invoices', 'invoice_items', 'expenses', 'suppliers'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "Users manage own rows" on public.%I', table_name);
    execute format(
      'create policy "Users manage own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end $$;

create or replace function public.mirror_business_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_json jsonb;
  item_json jsonb;
  item_number bigint;
begin
  insert into public.business_profiles (
    user_id, id, name, category, country, currency, branch_name, logo_url, updated_at
  ) values (
    new.user_id,
    coalesce(nullif(new.business->>'id', ''), new.user_id::text),
    coalesce(nullif(new.business->>'name', ''), 'My business'),
    coalesce(new.business->>'category', ''),
    coalesce(new.business->>'country', ''),
    coalesce(nullif(new.business->>'currency', ''), 'NGN'),
    coalesce(new.business->>'branchName', ''),
    nullif(new.business->>'logoUrl', ''),
    new.updated_at
  )
  on conflict (user_id) do update set
    id = excluded.id,
    name = excluded.name,
    category = excluded.category,
    country = excluded.country,
    currency = excluded.currency,
    branch_name = excluded.branch_name,
    logo_url = excluded.logo_url,
    updated_at = excluded.updated_at;

  delete from public.sale_items where user_id = new.user_id;
  delete from public.invoice_items where user_id = new.user_id;
  delete from public.sales where user_id = new.user_id;
  delete from public.invoices where user_id = new.user_id;
  delete from public.products where user_id = new.user_id;
  delete from public.customers where user_id = new.user_id;
  delete from public.expenses where user_id = new.user_id;
  delete from public.suppliers where user_id = new.user_id;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'products', '[]'::jsonb)) loop
    insert into public.products values (
      new.user_id, record_json->>'id', record_json->>'name', coalesce(record_json->>'category', ''),
      nullif(record_json->>'imageUrl', ''), coalesce((record_json->>'costPrice')::numeric, 0),
      coalesce((record_json->>'sellingPrice')::numeric, 0), coalesce((record_json->>'stockQuantity')::numeric, 0),
      coalesce((record_json->>'lowStockThreshold')::numeric, 0), nullif(record_json->>'supplierId', ''),
      coalesce((record_json->>'createdAt')::timestamptz, now())
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'customers', '[]'::jsonb)) loop
    insert into public.customers values (
      new.user_id, record_json->>'id', record_json->>'fullName', coalesce(record_json->>'phoneNumber', ''),
      nullif(record_json->>'emailAddress', ''), nullif(record_json->>'address', ''), nullif(record_json->>'notes', ''),
      coalesce((record_json->>'totalBought')::numeric, 0), coalesce((record_json->>'amountOwed')::numeric, 0),
      coalesce((record_json->>'createdAt')::timestamptz, now())
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'sales', '[]'::jsonb)) loop
    insert into public.sales values (
      new.user_id, record_json->>'id', nullif(record_json->>'customerId', ''), nullif(record_json->>'customerName', ''),
      coalesce((record_json->>'subtotal')::numeric, 0), coalesce((record_json->>'total')::numeric, 0),
      coalesce(record_json->>'paymentMethod', 'CASH'), nullif(record_json->>'notes', ''),
      coalesce((record_json->>'createdAt')::timestamptz, now())
    );
    for item_json, item_number in
      select value, ordinality from jsonb_array_elements(coalesce(record_json->'items', '[]'::jsonb)) with ordinality
    loop
      insert into public.sale_items values (
        new.user_id, record_json->>'id', item_number::integer, coalesce(item_json->>'productId', 'custom'),
        item_json->>'productName', coalesce((item_json->>'quantity')::numeric, 0), coalesce((item_json->>'price')::numeric, 0)
      );
    end loop;
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'invoices', '[]'::jsonb)) loop
    insert into public.invoices values (
      new.user_id, record_json->>'id', record_json->>'customerId', record_json->>'customerName',
      coalesce((record_json->>'total')::numeric, 0), coalesce(record_json->>'status', 'UNPAID'),
      (record_json->>'dueDate')::date, nullif(record_json->>'terms', ''),
      coalesce((record_json->>'createdAt')::timestamptz, now())
    );
    for item_json, item_number in
      select value, ordinality from jsonb_array_elements(coalesce(record_json->'items', '[]'::jsonb)) with ordinality
    loop
      insert into public.invoice_items values (
        new.user_id, record_json->>'id', item_number::integer, coalesce(item_json->>'productId', 'custom'),
        item_json->>'productName', coalesce((item_json->>'quantity')::numeric, 0), coalesce((item_json->>'price')::numeric, 0)
      );
    end loop;
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'expenses', '[]'::jsonb)) loop
    insert into public.expenses values (
      new.user_id, record_json->>'id', coalesce((record_json->>'amount')::numeric, 0), record_json->>'category',
      record_json->>'description', nullif(record_json->>'merchant', ''), (record_json->>'date')::date,
      coalesce((record_json->>'isRecurring')::boolean, false), coalesce((record_json->>'createdAt')::timestamptz, now())
    );
  end loop;

  for record_json in select value from jsonb_array_elements(coalesce(new.data->'suppliers', '[]'::jsonb)) loop
    insert into public.suppliers values (
      new.user_id, record_json->>'id', record_json->>'name', coalesce(record_json->>'phoneNumber', ''),
      nullif(record_json->>'emailAddress', ''), nullif(record_json->>'address', ''),
      coalesce((record_json->>'outstandingBalance')::numeric, 0), coalesce((record_json->>'createdAt')::timestamptz, now())
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists mirror_business_workspace_relations on public.business_workspaces;
create trigger mirror_business_workspace_relations
after insert or update of business, data on public.business_workspaces
for each row execute function public.mirror_business_workspace();

-- Backfill users who already have a cloud workspace.
update public.business_workspaces set data = data;

create index if not exists products_user_created_idx on public.products(user_id, created_at desc);
create index if not exists customers_user_created_idx on public.customers(user_id, created_at desc);
create index if not exists sales_user_created_idx on public.sales(user_id, created_at desc);
create index if not exists invoices_user_created_idx on public.invoices(user_id, created_at desc);
create index if not exists expenses_user_date_idx on public.expenses(user_id, expense_date desc);
create index if not exists suppliers_user_created_idx on public.suppliers(user_id, created_at desc);
