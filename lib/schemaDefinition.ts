

export const MASTER_SCHEMA_SQL = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text,
  price numeric not null,
  "originalPrice" numeric,
  "costPrice" numeric,
  "monthlyPrice" numeric,
  category text,
  stock integer default 0,
  image text,
  images text[],
  specs jsonb default '{}'::jsonb,
  description text,
  tags text[],
  colors text[],
  "storageOptions" text[],
  variants jsonb default '[]'::jsonb,
  "isHero" boolean default false,
  "heroTitle" text,
  "heroSubtitle" text,
  "heroImage" text,
  "isFeatured" boolean default false,
  "isTicker" boolean default false,
  "reorderPoint" integer default 5,
  supplier text,
  sku text,
  rating numeric default 0,
  "reviewsCount" integer default 0,
  reviews jsonb default '[]'::jsonb,
  "imageSeed" integer,
  express boolean default false,
  seo jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Self-healing: Add columns if they are missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='monthlyPrice') then
    alter table public.products add column "monthlyPrice" numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='reviews') then
    alter table public.products add column reviews jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='imageSeed') then
    alter table public.products add column "imageSeed" integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='isHero') then
    alter table public.products add column "isHero" boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='heroTitle') then
    alter table public.products add column "heroTitle" text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='heroSubtitle') then
    alter table public.products add column "heroSubtitle" text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='heroImage') then
    alter table public.products add column "heroImage" text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='isFeatured') then
    alter table public.products add column "isFeatured" boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='isTicker') then
    alter table public.products add column "isTicker" boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='originalPrice') then
    alter table public.products add column "originalPrice" numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='costPrice') then
    alter table public.products add column "costPrice" numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='storageOptions') then
    alter table public.products add column "storageOptions" text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='reviewsCount') then
    alter table public.products add column "reviewsCount" integer default 0;
  end if;
end $$;

-- 2. ORDERS
create table if not exists public.orders (
  id text primary key,
  date text,
  total numeric,
  status text,
  "paymentStatus" text,
  "paymentMethod" text,
  items jsonb,
  customer jsonb,
  "fraudScore" numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CUSTOMERS
create table if not exists public.customers (
  id text primary key,
  name text,
  email text,
  phone text,
  segment text,
  "totalSpent" numeric default 0,
  "ordersCount" integer default 0,
  "lastOrderDate" text,
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
  "managerId" text,
  "openingHours" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. ROLES
create table if not exists public.roles (
  id text primary key,
  name text,
  permissions text[],
  "isSystem" boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. APP SETTINGS
create table if not exists public.app_settings (
  id serial primary key,
  "storeName" text,
  currency text,
  "supportEmail" text,
  "supportPhone" text,
  "taxRate" numeric,
  "deliveryFee" numeric,
  "freeShippingThreshold" numeric,
  "enableKnet" boolean,
  "enableCreditCard" boolean,
  "enableWhatsAppPayment" boolean default true,
  "aiProvider" text,
  "socialLinks" jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Self-healing for settings
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='app_settings' and column_name='enableWhatsAppPayment') then
    alter table public.app_settings add column "enableWhatsAppPayment" boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='app_settings' and column_name='socialLinks') then
    alter table public.app_settings add column "socialLinks" jsonb;
  end if;
end $$;

-- 7. RETURNS
create table if not exists public.returns (
  id text primary key,
  "orderId" text,
  "customerEmail" text,
  reason text,
  condition text,
  details text,
  status text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. STORAGE & BUCKETS
-- Attempt to create the storage bucket. 
-- Note: Requires pg_net or similar in some setups, but this insert works for standard Supabase Storage schema.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Auth Upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

create policy "Auth Update"
  on storage.objects for update
  using ( bucket_id = 'product-images' );

-- Insert Default Settings
insert into public.app_settings ("storeName", currency, "deliveryFee", "freeShippingThreshold", "supportEmail")
select 'LAKKI PHONES', 'KWD', 5, 50, 'support@lakkiphones.com'
where not exists (select 1 from public.app_settings);

-- Insert Default Roles
insert into public.roles (id, name, permissions, "isSystem", description)
values 
('role-super', 'Super Admin', ARRAY['all'], true, 'Full system access'),
('role-shop-admin', 'Shop Admin', ARRAY['manage_orders', 'manage_inventory', 'view_reports', 'manage_customers'], true, 'Manage specific store operations'),
('role-sales', 'Sales', ARRAY['manage_orders', 'view_products'], true, 'POS and basic order handling'),
('role-warehouse', 'Warehouse Staff', ARRAY['manage_inventory'], true, 'Inventory and stock transfer')
on conflict (id) do nothing;

-- Enable RLS
alter table products enable row level security;
create policy "Public Read" on products for select using (true);
create policy "Admin Write" on products for all using (true);

alter table orders enable row level security;
create policy "Public Read Orders" on orders for select using (true);
create policy "Admin Write Orders" on orders for all using (true);

alter table app_settings enable row level security;
create policy "Public Read Settings" on app_settings for select using (true);
create policy "Admin Write Settings" on app_settings for all using (true);

alter table roles enable row level security;
create policy "Public Read Roles" on roles for select using (true);
create policy "Admin Write Roles" on roles for all using (true);

alter table customers enable row level security;
create policy "Public Read Customers" on customers for select using (true);
create policy "Admin Write Customers" on customers for all using (true);

alter table warehouses enable row level security;
create policy "Public Read Warehouses" on warehouses for select using (true);
create policy "Admin Write Warehouses" on warehouses for all using (true);

alter table returns enable row level security;
create policy "Public Read Returns" on returns for select using (true);
create policy "Admin Write Returns" on returns for all using (true);
`;