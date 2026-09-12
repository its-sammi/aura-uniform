-- Run this in the Supabase SQL Editor after the base schema has been applied.
-- It links the existing Auth user; it never creates a second Auth user.

insert into public.admin_profiles (user_id, full_name, role)
select id, 'AURA UNIFORM Admin', 'admin'
from auth.users
where lower(email) = lower('akbhi143@gmail.com')
on conflict (user_id) do update
set full_name = excluded.full_name,
    role = excluded.role;

drop policy if exists "Admin read profiles" on public.admin_profiles;
create policy "Admin read profiles" on public.admin_profiles
for select using (
  auth.uid() = user_id
  and role in ('admin', 'super_admin')
);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins manage businesses" on public.businesses;
create policy "Admins manage businesses" on public.businesses for all using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images for all using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);
