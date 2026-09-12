import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminImagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('product_images')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else setError('');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const removeImage = async (item: any) => {
    if (!window.confirm('Remove this product image?')) return;
    setError('');
    const { error: storageError } = await supabase.storage.from('product-images').remove([item.path]);
    if (storageError) {
      setError(storageError.message);
      return;
    }
    const { error: deleteError } = await supabase.from('product_images').delete().eq('id', item.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await fetchImages();
  };

  if (loading) return <div>Loading images…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Media library</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Images</h1>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-soft">
            <img src={item.url} alt="Product asset" className="h-52 w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-3 text-sm text-slate-600">
              <div>
                <div className="font-medium text-slate-900">{item.product?.name || 'Product image'}</div>
                <div>Stored in Supabase Storage</div>
              </div>
              <button type="button" onClick={() => removeImage(item)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600" aria-label={`Remove image for ${item.product?.name || 'product'}`}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )) : <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-slate-500">No images uploaded yet.</div>}
      </div>
    </div>
  );
}
