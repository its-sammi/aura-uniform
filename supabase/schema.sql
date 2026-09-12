create extension if not exists "pgcrypto";

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  email text,
  phone text,
  whatsapp text,
  address text,
  business_hours text,
  facebook_url text,
  instagram_url text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer default 0,
  brand_name text,
  show_home boolean not null default true,
  show_section boolean not null default true,
  showcase_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, slug)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price numeric(12,2),
  price_label text,
  featured boolean default false,
  published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, slug)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  path text not null,
  sort_order integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create table if not exists admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz default now()
);

create index if not exists idx_categories_business_sort on categories (business_id, sort_order);
create index if not exists idx_products_business_published on products (business_id, published, sort_order);
create index if not exists idx_products_category on products (category_id);
create index if not exists idx_product_images_product on product_images (product_id, sort_order);

alter table businesses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table admin_profiles enable row level security;

create policy "Public read businesses" on businesses for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (published = true);
create policy "Public read product images" on product_images for select using (true);
create policy "Admin read profiles" on admin_profiles for select using (
  auth.uid() = user_id
  and role in ('admin', 'super_admin')
);

create policy "Admins manage categories" on categories for all using (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

create policy "Admins manage businesses" on businesses for all using (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

create policy "Admins manage products" on products for all using (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

create policy "Admins manage product images" on product_images for all using (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_businesses before update on businesses
for each row execute function update_updated_at();

create trigger set_updated_at_categories before update on categories
for each row execute function update_updated_at();

create trigger set_updated_at_products before update on products
for each row execute function update_updated_at();

insert into businesses (slug, name, description, email, phone, whatsapp, address, business_hours, facebook_url, instagram_url, location)
values
  ('aura', 'AURA UNIFORM', 'AURA UNIFORM', 'vijaypratap1380@gmail.com', '+91 8272016950', '+91 8272016950', 'sec 13 Phase 11 Mohali Chandigarh', null, 'https://www.facebook.com/share/1BvVya4yn9/?mibextid=wwXIfr', null, 'Mohali Chandigarh')
on conflict (slug) do nothing;

insert into categories (business_id, name, slug, sort_order)
select id, 'Uniform', 'uniform', 1 from businesses where slug = 'aura'
on conflict (business_id, slug) do nothing;

insert into categories (business_id, name, slug, sort_order)
select id, 'Winter', 'winter', 2 from businesses where slug = 'aura'
on conflict (business_id, slug) do nothing;

insert into categories (business_id, name, slug, sort_order)
select id, 'Plain T-Shirt', 'plain-t-shirt', 3 from businesses where slug = 'aura'
on conflict (business_id, slug) do nothing;

