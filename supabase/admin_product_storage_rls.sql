-- Apply in the Supabase SQL Editor for the live project.
-- This keeps RLS enabled and uses the existing admin_profiles role check.

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');
