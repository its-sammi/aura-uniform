import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Search, Copy, ArchiveRestore } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, Product, ProductImage } from '../../types';

const emptyForm = {
  id: '',
  business_id: '',
  category_id: '',
  brand_name: '',
  name: '',
  description: '',
  price: '',
  price_label: '',
  featured: false,
  published: false,
  sort_order: 0,
  show_home: true,
  show_section: true,
  showcase_order: 0,
  active: true,
  archived: false,
  availability: '',
  sizes: '',
  variants: '',
  badges: '',
  images: [] as ProductImage[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [archivedFilter, setArchivedFilter] = useState('active');
  const [sortMode, setSortMode] = useState('newest');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removedImages, setRemovedImages] = useState<ProductImage[]>([]);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const loadData = async () => {
    setLoading(true);
    const [businessResult, categoryResult, productResult] = await Promise.all([
      supabase.from('businesses').select('id, slug'),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
      .from('products')
      .select('*, category:categories(*), business:businesses(*), images:product_images(*)')
      .order('created_at', { ascending: false }),
    ]);

    const loadError = businessResult.error ?? categoryResult.error ?? productResult.error;
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const businessData = businessResult.data;
    const categoryData = categoryResult.data;
    const productData = productResult.data;

    const auraBusinesses = (businessData ?? []).filter((business) => business.slug === 'aura');
    const auraBusinessIds = new Set(auraBusinesses.map((business) => business.id));
    setBusinesses(auraBusinesses);
    setCategories((categoryData ?? []).filter((category) => auraBusinessIds.has(category.business_id)));
    setProducts((productData ?? []).filter((product) => auraBusinessIds.has(product.business_id)));
    setForm((previous) => previous.business_id ? previous : {
      ...previous,
      business_id: businessData?.find((business) => business.slug === 'aura')?.id ?? businessData?.[0]?.id ?? '',
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) => {
        const productBrand = businesses.find((business) => business.id === product.business_id)?.slug ?? 'aura';
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesBrand = brandFilter === 'all' || productBrand === brandFilter;
        const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
        const matchesPublished = publishedFilter === 'all' || String(product.published) === publishedFilter;
        const matchesFeatured = featuredFilter === 'all' || String(product.featured) === featuredFilter;
        const isArchived = product.archived === true;
        const matchesArchived = archivedFilter === 'all' || isArchived === (archivedFilter === 'archived');
        return matchesSearch && matchesBrand && matchesCategory && matchesPublished && matchesFeatured && matchesArchived;
      })
      .sort((a, b) => {
        if (sortMode === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortMode === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortMode === 'name') return a.name.localeCompare(b.name);
        if (sortMode === 'price') return Number(b.price ?? 0) - Number(a.price ?? 0);
        return Number(b.sort_order ?? 0) - Number(a.sort_order ?? 0);
      });
  }, [archivedFilter, brandFilter, categories, featuredFilter, products, publishedFilter, search, sortMode]);

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Only JPG, PNG, and WebP files up to 5MB are allowed.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSuccess('Image selected. Save the product to upload it.');
  };

  const removeUploadImage = (index: number) => {
    setForm((prev) => {
      const image = prev.images[index];
      if (image) setRemovedImages((current) => [...current, image]);
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
  };

  const uploadProductImage = async (productId: string, file: File): Promise<ProductImage> => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { data, error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return {
      id: crypto.randomUUID(),
      product_id: productId,
      url: urlData.publicUrl,
      path: data.path,
      sort_order: 0,
      is_primary: true,
    };
  };

  const removeStorageImages = async (images: ProductImage[]) => {
    const paths = images.map((image) => image.path).filter(Boolean);
    if (!paths.length) return;
    const { error: storageError } = await supabase.storage.from('product-images').remove(paths);
    if (storageError) throw storageError;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setRemovedImages([]);
    setUploadInputKey((key) => key + 1);
  };

  const submitProduct = async () => {
    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.category_id) {
      setError('Please select a category.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (!form.business_id) {
        throw new Error('Selected business could not be loaded from the database.');
      }

      const productPayload = {
        business_id: form.business_id,
        category_id: form.category_id,
        brand_name: form.brand_name.trim() || 'AURA UNIFORM',
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product',
        description: form.description || null,
        price: form.price ? Number(form.price) : null,
        price_label: form.price_label || null,
        featured: form.featured,
        published: form.published,
        sort_order: Number(form.sort_order || 0),
        show_home: form.show_home,
        show_section: form.show_section,
        showcase_order: Number(form.showcase_order || 0),
        active: form.active,
        archived: form.archived,
        availability: form.availability.trim() || null,
        sizes: form.sizes.split(',').map((value) => value.trim()).filter(Boolean),
        variants: form.variants.split(',').map((value) => value.trim()).filter(Boolean).map((value) => ({ name: 'Variant', value })),
        badges: form.badges.split(',').map((value) => value.trim()).filter(Boolean),
      };

      if (editingId) {
        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (updateError) throw updateError;

        if (selectedFile) {
          const previousImages = products.find((product) => product.id === editingId)?.images ?? [];
          const uploadedImage = await uploadProductImage(editingId, selectedFile);
          const { error: imageError } = await supabase.from('product_images').insert(uploadedImage);
          if (imageError) {
            await removeStorageImages([uploadedImage]);
            throw imageError;
          }
          const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', editingId).neq('id', uploadedImage.id);
          if (deleteError) throw deleteError;
          await removeStorageImages(previousImages);
        } else if (removedImages.length) {
          await removeStorageImages(removedImages);
          const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .in('id', removedImages.map((image) => image.id));
          if (deleteError) throw deleteError;
        }
        setSuccess('Product updated successfully.');
      } else {
        const { data: inserted, error: insertError } = await supabase.from('products').insert(productPayload).select().single();
        if (insertError) throw insertError;
        if (selectedFile) {
          const uploadedImage = await uploadProductImage(inserted.id, selectedFile);
          const { error: imageError } = await supabase.from('product_images').insert(uploadedImage);
          if (imageError) {
            await removeStorageImages([uploadedImage]);
            throw new Error(`Product was created, but the image could not be associated: ${imageError.message}`);
          }
        }
        setSuccess('Product created successfully.');
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      business_id: product.business_id,
      category_id: product.category_id ?? '',
      brand_name: product.brand_name ?? product.business?.name ?? 'AURA UNIFORM',
      name: product.name,
      description: product.description ?? '',
      price: product.price ? String(product.price) : '',
      price_label: product.price_label ?? '',
      featured: product.featured,
      published: product.published,
      sort_order: product.sort_order,
      show_home: product.show_home,
      show_section: product.show_section,
      showcase_order: product.showcase_order,
      active: product.active !== false,
      archived: product.archived === true,
      availability: product.availability ?? '',
      sizes: (product.sizes ?? []).join(', '),
      variants: (product.variants ?? []).map((variant) => variant.value).join(', '),
      badges: (product.badges ?? []).join(', '),
      images: product.images ?? [],
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setRemovedImages([]);
    setUploadInputKey((key) => key + 1);
  };

  const togglePublish = async (product: Product) => {
    setError('');
    const { error: updateError } = await supabase.from('products').update({ published: !product.published }).eq('id', product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadData();
  };

  const toggleFeatured = async (product: Product) => {
    setError('');
    const { error: updateError } = await supabase.from('products').update({ featured: !product.featured }).eq('id', product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadData();
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;
    setError('');
    try {
      await removeStorageImages(product.images ?? []);
      const { error: imageError } = await supabase.from('product_images').delete().eq('product_id', product.id);
      if (imageError) throw imageError;
      const { error: productError } = await supabase.from('products').delete().eq('id', product.id);
      if (productError) throw productError;
      await loadData();
      setSuccess('Product deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  };

  const archiveProduct = async (product: Product) => {
    const { error: updateError } = await supabase.from('products').update({ archived: !product.archived, active: product.archived }).eq('id', product.id);
    if (updateError) setError(updateError.message);
    else await loadData();
  };

  const duplicateProduct = async (product: Product) => {
    setError('');
    const payload = {
      business_id: product.business_id,
      category_id: product.category_id,
      name: `${product.name} Copy`,
      slug: `${product.slug}-copy-${Date.now()}`,
      description: product.description,
      price: product.price,
      price_label: product.price_label,
      brand_name: product.brand_name,
      featured: false,
      published: false,
      sort_order: product.sort_order,
      showcase_order: product.showcase_order,
      active: true,
      archived: false,
      availability: product.availability,
      sizes: product.sizes ?? [],
      variants: product.variants ?? [],
      badges: product.badges ?? [],
      show_home: false,
      show_section: false,
    };
    const { error: duplicateError } = await supabase.from('products').insert(payload);
    if (duplicateError) setError(duplicateError.message);
    else { setSuccess('Product duplicated as a draft.'); await loadData(); }
  };

  const brandOptions = businesses.map((business) => ({ value: business.id, label: 'AURA Uniform' }));

  const categoryOptions = categories.filter((category) => category.business_id === form.business_id);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-5 sm:gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Catalog</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">Manage the products displayed across both brands.</p>
        </div>
        <button type="button" onClick={resetForm} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition sm:self-auto">
          <Plus size={16} /> Add product
        </button>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit product' : 'Add product'}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
              <select value={form.business_id} onChange={(e) => handleFieldChange('business_id', e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5">
                {brandOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <input value={form.brand_name} onChange={(e) => handleFieldChange('brand_name', e.target.value)} placeholder="Brand name shown publicly" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select value={form.category_id} onChange={(e) => handleFieldChange('category_id', e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5">
                <option value="">Select</option>
                {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Product name</label>
              <input value={form.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => handleFieldChange('description', e.target.value)} className="min-h-[120px] w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
                <input type="number" value={form.price} onChange={(e) => handleFieldChange('price', e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <input type="checkbox" checked={form.active} onChange={() => handleFieldChange('active', !form.active)} /> Active
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <input type="checkbox" checked={form.archived} onChange={() => handleFieldChange('archived', !form.archived)} /> Archived
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.availability} onChange={(e) => handleFieldChange('availability', e.target.value)} placeholder="Availability (e.g. In stock)" className="min-h-11 rounded-xl border border-slate-300 px-3 py-2.5" />
                <input value={form.sizes} onChange={(e) => handleFieldChange('sizes', e.target.value)} placeholder="Sizes, comma separated" className="min-h-11 rounded-xl border border-slate-300 px-3 py-2.5" />
                <input value={form.variants} onChange={(e) => handleFieldChange('variants', e.target.value)} placeholder="Variants, comma separated" className="min-h-11 rounded-xl border border-slate-300 px-3 py-2.5" />
                <input value={form.badges} onChange={(e) => handleFieldChange('badges', e.target.value)} placeholder="Badges: New, Bestseller" className="min-h-11 rounded-xl border border-slate-300 px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price label</label>
                <input value={form.price_label} onChange={(e) => handleFieldChange('price_label', e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={form.featured} onChange={() => handleFieldChange('featured', !form.featured)} /> Featured
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={form.published} onChange={() => handleFieldChange('published', !form.published)} /> Published
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={form.show_home} onChange={() => handleFieldChange('show_home', !form.show_home)} /> Show on Home Page
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={form.show_section} onChange={() => handleFieldChange('show_section', !form.show_section)} /> Show on Section Page
              </label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => handleFieldChange('sort_order', Number(e.target.value))} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Showcase position</label>
              <input type="number" value={form.showcase_order} onChange={(e) => handleFieldChange('showcase_order', Number(e.target.value))} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Images</label>
              <input key={uploadInputKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3" />
              {uploading ? <div className="mt-2 text-sm text-slate-500">Uploading…</div> : null}
              <div className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP up to 5MB. The image uploads when you save.</div>
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
                <img src={previewUrl} alt="Selected product preview" className="h-40 w-full object-cover" />
                <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); setUploadInputKey((key) => key + 1); }} className="w-full px-2 py-2 text-sm font-medium text-red-600">Clear selected image</button>
              </div>
            ) : null}

            {form.images.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {form.images.map((image, index) => (
                  <div key={image.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img src={image.url} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                    <button type="button" onClick={() => removeUploadImage(index)} className="w-full px-2 py-2 text-sm font-medium text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            ) : null}

            <button type="button" disabled={busy || uploading} onClick={submitProduct} className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="min-h-11 w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="all">All brands</option>
                <option value="aura">AURA</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="all">All categories</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="all">All status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
              <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="all">All feature</option>
                <option value="true">Featured</option>
                <option value="false">Not featured</option>
              </select>
              <select value={archivedFilter} onChange={(e) => setArchivedFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="active">Active only</option>
                <option value="archived">Archived</option>
                <option value="all">All lifecycle</option>
              </select>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Brand</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Featured</th>
                  <th className="py-3 pr-4">Showcase</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-200 align-middle">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                    </td>
                    <td className="py-3 pr-4">{product.brand_name || 'AURA UNIFORM'}</td>
                    <td className="py-3 pr-4">{product.category?.name || '—'}</td>
                    <td className="py-3 pr-4">{product.published ? 'Published' : 'Draft'}</td>
                    <td className="py-3 pr-4">{product.featured ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-4">{product.show_home || product.show_section ? 'Visible' : 'Hidden'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleEdit(product)} className="rounded-full border border-slate-300 p-2 text-slate-700"><Pencil size={14} /></button>
                        <button type="button" onClick={() => togglePublish(product)} className="rounded-full border border-slate-300 p-2 text-slate-700">{product.published ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        <button type="button" onClick={() => toggleFeatured(product)} className="rounded-full border border-slate-300 p-2 text-slate-700"><Star size={14} /></button>
                        <button type="button" onClick={() => duplicateProduct(product)} className="rounded-full border border-slate-300 p-2 text-slate-700" aria-label={`Duplicate ${product.name}`}><Copy size={14} /></button>
                        <button type="button" onClick={() => archiveProduct(product)} className="rounded-full border border-slate-300 p-2 text-slate-700" aria-label={`${product.archived ? 'Restore' : 'Archive'} ${product.name}`}><ArchiveRestore size={14} /></button>
                        <button type="button" onClick={() => deleteProduct(product)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
