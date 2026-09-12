import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; slug: string }[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [business, setBusiness] = useState('aura');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    const { data: businessData } = await supabase.from('businesses').select('id, slug').order('name');
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    const auraBusinesses = (businessData ?? []).filter((item) => item.slug === 'aura');
    const auraBusinessIds = new Set(auraBusinesses.map((item) => item.id));
    setBusinesses(auraBusinesses);
    setCategories((data ?? []).filter((category) => auraBusinessIds.has(category.business_id)));
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const businessLookup = await supabase.from('businesses').select('id').eq('slug', business).maybeSingle();
      if (businessLookup.error) throw businessLookup.error;
      const businessId = businessLookup.data?.id;
      if (!businessId) throw new Error('Selected business could not be loaded from the database.');

      const businessCategoryCount = categories.filter((category) => category.business_id === businessId).length;
      const payload = {
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category',
        description: description.trim() || null,
        business_id: businessId,
        sort_order: editingId
          ? categories.find((category) => category.id === editingId)?.sort_order ?? businessCategoryCount + 1
          : businessCategoryCount + 1,
      };

      const result = editingId
        ? await supabase.from('categories').update(payload).eq('id', editingId)
        : await supabase.from('categories').insert(payload);
      if (result.error) throw result.error;

      setName('');
      setDescription('');
      setBusiness('aura');
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    setError('');
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await loadCategories();
  };

  if (loading) return <div>Loading categories…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Categories</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Manage categories</h1>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
        {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_200px_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="rounded-xl border border-slate-300 px-3 py-2.5" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="rounded-xl border border-slate-300 px-3 py-2.5" />
          <select value={business} onChange={(e) => setBusiness(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5">
            {businesses.map((item) => <option key={item.id} value={item.slug}>AURA</option>)}
          </select>
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
            <Plus size={16} /> {editingId ? 'Update' : 'Add'}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{category.name}</div>
                <div className="text-sm text-slate-500">AURA</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { 
                  setEditingId(category.id); 
                  setName(category.name); 
                  setDescription(category.description ?? '');
                  const mapped = businesses.find((item) => item.id === category.business_id)?.slug ?? 'aura';
                  setBusiness(mapped);
                }} className="rounded-full border border-slate-300 p-2"><Pencil size={14} /></button>
                <button type="button" onClick={() => handleDelete(category)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
