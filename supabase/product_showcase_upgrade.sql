-- Idempotent product/showcase upgrade. Keeps existing RLS enabled.
alter table public.products
  add column if not exists brand_name text,
  add column if not exists show_home boolean not null default true,
  add column if not exists show_section boolean not null default true,
  add column if not exists showcase_order integer not null default 0,
  add column if not exists active boolean not null default true,
  add column if not exists archived boolean not null default false,
  add column if not exists availability text,
  add column if not exists sizes jsonb not null default '[]'::jsonb,
  add column if not exists variants jsonb not null default '[]'::jsonb,
  add column if not exists badges jsonb not null default '[]'::jsonb;

update public.products
set brand_name = coalesce(nullif(brand_name, ''), 'AURA UNIFORM'),
    active = coalesce(active, true),
    archived = coalesce(archived, false),
    show_home = coalesce(show_home, true),
    show_section = coalesce(show_section, true),
    showcase_order = coalesce(showcase_order, sort_order, 0),
    sizes = coalesce(sizes, '[]'::jsonb),
    variants = coalesce(variants, '[]'::jsonb),
    badges = coalesce(badges, '[]'::jsonb)
where brand_name is null
   or active is null
   or archived is null
   or show_home is null
   or show_section is null
   or showcase_order is null
   or sizes is null
   or variants is null
   or badges is null;

create table if not exists public.showcase_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  title text not null,
  subtitle text,
  theme text not null default 'monsoon',
  visible boolean not null default true,
  section_order integer not null default 0,
  animation_speed numeric(4,2) not null default 0.55,
  auto_rotate boolean not null default false,
  animation_intensity numeric(4,2) not null default 1,
  background text not null default '#edf4eb',
  accent text not null default '#4e745d',
  text_color text not null default '#26302a',
  updated_at timestamptz not null default now(),
  unique (business_id, category_id)
);

create index if not exists idx_showcase_settings_business_order
  on public.showcase_settings (business_id, section_order);

create or replace function public.update_showcase_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_showcase_settings_updated_at on public.showcase_settings;
create trigger set_showcase_settings_updated_at
before update on public.showcase_settings
for each row execute function public.update_showcase_settings_updated_at();

grant select on public.showcase_settings to anon, authenticated;
grant insert, update, delete on public.showcase_settings to authenticated;

alter table public.showcase_settings enable row level security;
drop policy if exists "Public read showcase settings" on public.showcase_settings;
create policy "Public read showcase settings" on public.showcase_settings
for select using (visible = true);
drop policy if exists "Admins manage showcase settings" on public.showcase_settings;
create policy "Admins manage showcase settings" on public.showcase_settings
for all to authenticated
using (
  exists (select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin'))
)
with check (
  exists (select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin'))
);

insert into public.showcase_settings (business_id, category_id, title, subtitle, theme, section_order, background, accent)
select b.id, c.id, c.name, 'Curated essentials for every season.',
  case c.slug when 'winter' then 'winter' when 'plain-t-shirt' then 'summer' else 'monsoon' end,
  c.sort_order,
  case c.slug when 'winter' then '#edf3f7' when 'plain-t-shirt' then '#f5f0e9' else '#edf4eb' end,
  case c.slug when 'winter' then '#47677a' when 'plain-t-shirt' then '#b7652f' else '#4e745d' end
from public.businesses b
join public.categories c on c.business_id = b.id
where b.slug = 'aura'
on conflict (business_id, category_id) do nothing;

notify pgrst, 'reload schema';
