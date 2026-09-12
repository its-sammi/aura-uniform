import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, Eye, FilePenLine, PackageCheck, Tags } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalProducts: 0, published: 0, drafts: 0, totalCategories: 0 });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: false }),
        supabase.from('categories').select('*', { count: 'exact', head: false }),
      ]);

      const products = productsResult.data ?? [];
      const categories = categoriesResult.data ?? [];
      const queryError = productsResult.error ?? categoriesResult.error;
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      setStats({
        totalProducts: products.length,
        published: products.filter((p) => p.published).length,
        drafts: products.filter((p) => !p.published).length,
        totalCategories: categories.length,
      });

      const { data: recent, error: recentError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        setError(recentError.message);
        setLoading(false);
        return;
      }
      setRecentProducts(recent ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="rounded-[1.5rem] border border-[rgba(38,48,42,0.08)] bg-white p-8 text-[var(--muted)] shadow-[0_10px_30px_rgba(38,48,42,0.03)]">Loading dashboard…</div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Overview</div>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-charcoal)]">Dashboard</h1>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total products"
          value={String(stats.totalProducts)}
          helper="Across your catalogue"
          icon={PackageCheck}
          tone="sage"
        />
        <StatCard
          label="Published"
          value={String(stats.published)}
          helper="Visible on the website"
          icon={Eye}
          tone="teal"
        />
        <StatCard
          label="Drafts"
          value={String(stats.drafts)}
          helper="Ready for review"
          icon={FilePenLine}
          tone="amber"
        />
        <StatCard
          label="Categories"
          value={String(stats.totalCategories)}
          helper="Organising your range"
          icon={Tags}
          tone="plum"
        />
      </div>

      <div className="rounded-[2rem] border border-[rgba(38,48,42,0.08)] bg-white p-5 shadow-[0_12px_30px_rgba(38,48,42,0.04)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              <Clock3 size={13} />
              Activity
            </div>
            <h2 className="mt-1 text-xl font-semibold text-[var(--color-charcoal)]">Recently added products</h2>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[var(--color-very-light)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            Latest 5
          </div>
        </div>
        {recentProducts.length ? (
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-[rgba(38,48,42,0.08)] bg-[var(--color-ivory)] px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(0,117,107,0.25)] hover:bg-white hover:shadow-[0_10px_24px_rgba(38,48,42,0.06)]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${product.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="truncate font-medium text-[var(--color-charcoal)]">{product.name}</div>
                  </div>
                  <div className="mt-1 pl-4 text-sm text-[var(--muted)]">{product.published ? 'Published' : 'Draft'}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-[var(--muted)]">
                  {new Date(product.created_at).toLocaleDateString()}
                  <ArrowUpRight size={15} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[var(--muted)]">No products yet.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof PackageCheck;
  tone: 'sage' | 'teal' | 'amber' | 'plum';
}) {
  const toneStyles = {
    sage: 'bg-[var(--color-very-light)] text-[var(--brand-dark)]',
    teal: 'bg-[#e2f3ef] text-[#00756b]',
    amber: 'bg-[#fff3d9] text-[#a56a00]',
    plum: 'bg-[#f2eafa] text-[#76518f]',
  };

  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(38,48,42,0.08)] bg-white p-5 shadow-[0_12px_30px_rgba(38,48,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(38,48,42,0.08)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--color-very-light)] opacity-70 transition duration-300 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[var(--muted)]">{label}</div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-charcoal)]">{value}</div>
          <div className="mt-2 text-xs text-[var(--muted)]">{helper}</div>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
          <Icon size={19} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
