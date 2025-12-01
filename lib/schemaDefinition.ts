

export const MASTER_SCHEMA_SQL = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text,
  price numeric not null,
  original_price numeric,
  cost_price numeric,
  category text,
  stock integer default 0,
  image text,
  images text[],
  specs jsonb default '{}'::jsonb,
  description text,
  tags text[],
  colors text[],
  storage_options text[],
  variants jsonb default '[]'::jsonb,
  is_hero boolean default false,
  hero_title text,
  hero_subtitle text,
  hero_image text,
  is_featured boolean default false,
  is_ticker boolean default false,
  reorder_point integer default 5,
  supplier text,
  sku text,
  rating numeric default 0,
  reviews_count integer default 0,
  seo jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. ORDERS
create table if not exists public.orders (
  id text primary key,
  date text,
  total numeric,
  status text,
  payment_status text,
  payment_method text,
  items jsonb,
  customer jsonb,
  fraud_score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CUSTOMERS
create table if not exists public.customers (
  id text primary key,
  name text,
  email text,
  phone text,
  segment text,
  total_spent numeric default 0,
  orders_count integer default 0,
  last_order_date text,
  notes text,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. WAREHOUSES
create table if not exists public.warehouses (
  id text primary key,
  name text,
  location jsonb,
  capacity integer,
  utilization numeric,
  type text,
  phone text,
  manager_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. ROLES
create table if not exists public.roles (
  id text primary key,
  name text,
  permissions text[],
  is_system boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. APP SETTINGS
create table if not exists public.app_settings (
  id serial primary key,
  store_name text,
  currency text,
  support_email text,
  support_phone text,
  tax_rate numeric,
  delivery_fee numeric,
  free_shipping_threshold numeric,
  enable_knet boolean,
  enable_credit_card boolean,
  enable_whatsapp_payment boolean default true,
  ai_provider text,
  social_links jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. RETURNS
create table if not exists public.returns (
  id text primary key,
  order_id text,
  customer_email text,
  reason text,
  condition text,
  details text,
  status text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert Default Settings (Only if empty)
insert into public.app_settings (store_name, currency, delivery_fee, free_shipping_threshold, support_email)
select 'LAKKI PHONES', 'KWD', 5, 50, 'support@lakkiphones.com'
where not exists (select 1 from public.app_settings);

-- Insert Default Roles (Fix for greyed out dashboard)
insert into public.roles (id, name, permissions, is_system, description)
values 
('role-super', 'Super Admin', ARRAY['all'], true, 'Full system access'),
('role-shop-admin', 'Shop Admin', ARRAY['manage_orders', 'manage_inventory', 'view_reports', 'manage_customers'], true, 'Manage specific store operations'),
('role-sales', 'Sales', ARRAY['manage_orders', 'view_products'], true, 'POS and basic order handling'),
('role-warehouse', 'Warehouse Staff', ARRAY['manage_inventory'], true, 'Inventory and stock transfer')
on conflict (id) do nothing;

-- Enable RLS (Open access for demo purposes, secure in production)
alter table products enable row level security;
create policy "Public Access Products" on products for select using (true);
create policy "Admin Write Products" on products for all using (true);

alter table orders enable row level security;
create policy "Public Access Orders" on orders for select using (true);
create policy "Admin Write Orders" on orders for all using (true);

alter table app_settings enable row level security;
create policy "Public Access Settings" on app_settings for select using (true);
create policy "Admin Write Settings" on app_settings for all using (true);
`;