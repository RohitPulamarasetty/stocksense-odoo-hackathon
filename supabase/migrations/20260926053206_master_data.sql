create extension if not exists pgcrypto;

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text not null unique,
  address text,
  created_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references warehouses(id) on delete cascade,
  name text not null,
  short_code text not null,
  created_at timestamptz not null default now(),
  unique (warehouse_id, short_code)
);

create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('vendor', 'customer')),
  contact text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  uom text not null default 'unit',
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  reorder_level numeric(14,3) not null default 0 check (reorder_level >= 0),
  reorder_qty numeric(14,3) not null default 0 check (reorder_qty >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on products(category_id);
create index locations_warehouse_id_idx on locations(warehouse_id);

alter table categories enable row level security;
alter table warehouses enable row level security;
alter table locations enable row level security;
alter table partners enable row level security;
alter table products enable row level security;

create policy "authenticated read categories" on categories for select to authenticated using (true);
create policy "authenticated write categories" on categories for all to authenticated using (true) with check (true);

create policy "authenticated read warehouses" on warehouses for select to authenticated using (true);
create policy "authenticated write warehouses" on warehouses for all to authenticated using (true) with check (true);

create policy "authenticated read locations" on locations for select to authenticated using (true);
create policy "authenticated write locations" on locations for all to authenticated using (true) with check (true);

create policy "authenticated read partners" on partners for select to authenticated using (true);
create policy "authenticated write partners" on partners for all to authenticated using (true) with check (true);

create policy "authenticated read products" on products for select to authenticated using (true);
create policy "authenticated write products" on products for all to authenticated using (true) with check (true);
