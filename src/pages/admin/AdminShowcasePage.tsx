import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, Product, ShowcaseSettings } from '../../types';

export default function AdminShowcasePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShowcaseSettings[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [categoryResult, productResult, settingsResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*, category:categories(*)').order('sort_order'),
      supabase.from('showcase_settings').select('*').order('section_order'),
    ]);
    const loadError = categoryResult.error ?? productResult.error ?? settingsResult.error;
    if (loadError) {
      setError(loadError.message);
      return;
    }
    const nextCategories = categoryResult.data ?? [];
    const nextProducts = productResult.data ?? [];
    setCategories(nextCategories);
    setProducts([...nextProducts].sort((a, b) => (a.showcase_order ?? a.sort_order) - (b.showcase_order ?? b.sort_order)));
    setSettings(settingsResult.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async (product: Product, changes: Partial<Product>) => {
    setError('');
    setSuccess('');
    const { error: updateError } = await supabase.from('products').update(changes).eq('id', product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...changes } : item));
    setSuccess('Showcase settings saved.');
  };

  const saveSettings = async (setting: ShowcaseSettings, changes: Partial<ShowcaseSettings>) => {
    const { error: updateError } = await supabase.from('showcase_settings').update(changes).eq('id', setting.id);
    if (updateError) setError(updateError.message);
    else {
      setSettings((current) => current.map((item) => item.id === setting.id ? { ...item, ...changes } : item));
      setSuccess('Section theme saved.');
    }
  };

  const renderList = (title: string, list: Product[], key: 'home' | string) => (
    <section key={key} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Showcase</div>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-3">
        {list.length ? list.map((product, index) => (
          <div key={product.id} className="grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div>
              <div className="font-medium text-slate-900">{product.name}</div>
              <div className="text-sm text-slate-500">{product.brand_name || 'AURA UNIFORM'}</div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={key === 'home' ? product.show_home : product.show_section}
                onChange={(event) => save(product, key === 'home' ? { show_home: event.target.checked } : { show_section: event.target.checked })}
              />
              {key === 'home' ? 'Show on home' : 'Show in section'}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Position
              <input
                type="number"
                value={product.showcase_order ?? index}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setProducts((current) => current.map((item) => item.id === product.id ? { ...item, showcase_order: value } : item));
                }}
                onBlur={(event) => save(product, { showcase_order: Number(event.target.value) })}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1"
              />
            </label>
          </div>
        )) : <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No products assigned.</div>}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Content control</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Showcase manager</h1>
        <p className="mt-2 text-sm text-slate-500">Control home visibility, category sections, and product ordering.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}
      {renderList('Home Page showcase', products.filter((product) => product.show_home !== false), 'home')}
      {categories.map((category) => renderList(category.name, products.filter((product) => product.category_id === category.id && product.show_section !== false), category.id))}
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Theme editor</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Section appearance and motion</h2>
        </div>
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.id} className="grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <input value={setting.title} onChange={(event) => setSettings((current) => current.map((item) => item.id === setting.id ? { ...item, title: event.target.value } : item))} onBlur={(event) => saveSettings(setting, { title: event.target.value })} className="rounded-lg border border-slate-300 px-2 py-2" aria-label={`${setting.title} title`} />
              <input value={setting.subtitle ?? ''} onChange={(event) => setSettings((current) => current.map((item) => item.id === setting.id ? { ...item, subtitle: event.target.value } : item))} onBlur={(event) => saveSettings(setting, { subtitle: event.target.value })} className="rounded-lg border border-slate-300 px-2 py-2" placeholder="Subtitle" />
              <label className="flex items-center gap-2 text-sm">Theme <select value={setting.theme} onChange={(event) => saveSettings(setting, { theme: event.target.value as ShowcaseSettings['theme'] })} className="rounded-lg border border-slate-300 px-2 py-2"><option value="monsoon">Monsoon</option><option value="winter">Winter</option><option value="summer">Summer</option></select></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={setting.visible} onChange={(event) => saveSettings(setting, { visible: event.target.checked })} /> Visible</label>
              <label className="flex items-center gap-2 text-sm">Speed <input type="number" min="0.2" max="2" step="0.05" value={setting.animation_speed} onChange={(event) => setSettings((current) => current.map((item) => item.id === setting.id ? { ...item, animation_speed: Number(event.target.value) } : item))} onBlur={(event) => saveSettings(setting, { animation_speed: Number(event.target.value) })} className="w-20 rounded-lg border border-slate-300 px-2 py-2" /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={setting.auto_rotate} onChange={(event) => saveSettings(setting, { auto_rotate: event.target.checked })} /> Auto-rotate</label>
              <label className="flex items-center gap-2 text-sm">Background <input type="color" value={setting.background} onChange={(event) => saveSettings(setting, { background: event.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm">Accent <input type="color" value={setting.accent} onChange={(event) => saveSettings(setting, { accent: event.target.value })} /></label>
            </div>
          ))}
        </div>
      </section>
      <div className="flex items-center gap-2 text-xs text-slate-500"><Save size={14} /> Changes save directly to Supabase.</div>
    </div>
  );
}
