-- Adds product-level showcase controls without changing existing product data.
alter table public.products
  add column if not exists brand_name text,
  add column if not exists show_home boolean not null default true,
  add column if not exists show_section boolean not null default true,
  add column if not exists showcase_order integer not null default 0;

update public.products
set brand_name = coalesce(nullif(brand_name, ''), 'AURA UNIFORM')
where brand_name is null or brand_name = '';

create index if not exists idx_products_showcase
  on public.products (business_id, category_id, published, show_home, show_section, showcase_order);
