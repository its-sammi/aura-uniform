import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { APP_INFO, AURA_COLLECTIONS } from '../data/content';
import ProductCard from '../components/ProductCard';
import { getWhatsAppUrl } from '../lib/utils';
import { getBusinessCategories, getPublicProductQuery, supabase } from '../lib/supabase';
import { Category, Product, ShowcaseSettings } from '../types';
import WhatsAppButton from '../components/WhatsAppButton';

const testimonials = APP_INFO.aura.testimonials;
const auraPlaceholder = !APP_INFO.aura.profileImage;

export default function HomePage() {
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcaseSettings, setShowcaseSettings] = useState<ShowcaseSettings[]>([]);
  const [catalogueError, setCatalogueError] = useState('');

  useEffect(() => {
    const loadPublishedProducts = async () => {
      const [{ data, error }, categoryData, settingsResult] = await Promise.all([
        getPublicProductQuery(),
        getBusinessCategories(APP_INFO.aura.slug),
        supabase.from('showcase_settings').select('*').eq('visible', true).order('section_order'),
      ]);
      if (error) {
        setCatalogueError('Published products are temporarily unavailable.');
        return;
      }
      setPublishedProducts((data ?? []).filter((product) => product.business?.slug === 'aura'));
      setCategories(categoryData);
      setShowcaseSettings(settingsResult.data ?? []);
    };

    loadPublishedProducts();
  }, []);

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, Product[]>();
    publishedProducts.forEach((product) => {
      if (!product.category_id) return;
      const current = grouped.get(product.category_id) ?? [];
      if (product.show_section !== false) grouped.set(product.category_id, [...current, product].sort((a, b) => (a.showcase_order ?? a.sort_order) - (b.showcase_order ?? b.sort_order)));
    });
    return grouped;
  }, [publishedProducts]);

  return (
    <>
      <section id="home" className="relative overflow-hidden border-b" style={{ borderColor: 'var(--line)', background: 'var(--section)' }}>
        <div className="container-shell grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="eyebrow">Premium uniform partner</div>
            <h1 className="max-w-xl section-heading">Built for teams that work hard every day.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              AURA UNIFORM delivers dependable uniforms, winter wear, and everyday essentials with a premium finish that feels professional from first wear to final shift.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#aura" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95">Explore AURA UNIFORM <ArrowRight size={16} /></a>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand" /> Uniform</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand" /> Winter wear</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand" /> Plain T-Shirt</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 h-32 w-32 rounded-full bg-[var(--color-sage-light)] blur-3xl opacity-60" />
            <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-[var(--color-very-light)] blur-3xl opacity-80" />
            <div className="relative overflow-hidden rounded-[1.25rem] border bg-white p-5" style={{ borderColor: 'var(--line)' }}>
              <img src={APP_INFO.aura.profileImage} alt="AURA UNIFORM logo" className="h-[500px] w-full rounded-[1rem] bg-white object-contain p-4" />
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--color-very-light)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">AURA</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">Uniform & T-Shirts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="aura" className="py-20">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">AURA UNIFORM</div>
              <h2 className="section-heading">Premium essentials for everyday workwear.</h2>
            </div>
            <WhatsAppButton url={APP_INFO.aura.whatsappUrl} label="WhatsApp AURA" className="w-full sm:w-auto" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="brand-card">
              {auraPlaceholder ? (
                <div className="mb-6 flex h-52 items-center justify-center rounded-[1.25rem] border border-dashed border-[rgba(38,48,42,0.18)] bg-[linear-gradient(135deg,#edf4eb,#f7f5ee)] text-center">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">AURA</div>
                    <div className="mt-3 text-2xl font-semibold tracking-[0.16em] text-[var(--color-charcoal)]">UNIFORM</div>
                    <div className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Profile image pending upload</div>
                  </div>
                </div>
              ) : (
                <img src={APP_INFO.aura.profileImage} alt="AURA UNIFORM logo" className="mb-6 h-52 w-full rounded-[1.25rem] bg-white object-contain p-3" />
              )}
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3"><Building2 size={16} className="text-slate-900" /> {APP_INFO.aura.name}</div>
                <div className="flex items-center gap-3"><Phone size={16} className="text-slate-900" /> <a href={`tel:${APP_INFO.aura.phone.replace(/\s/g, '')}`} className="hover:text-slate-900">{APP_INFO.aura.phone}</a></div>
                <div className="flex items-center gap-3"><Mail size={16} className="text-slate-900" /> <a href={`mailto:${APP_INFO.aura.email}`} className="hover:text-slate-900">{APP_INFO.aura.email}</a></div>
                <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-900" /> {APP_INFO.aura.address}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="brand-card">
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <a key={category.id} href={`#category-${category.slug}`} className="rounded-full border border-[var(--line)] bg-[var(--color-very-light)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">{category.name}</a>
                  ))}
                </div>
                <p className="mt-5 text-slate-600">AURA UNIFORM currently offers essential workwear categories. New products can be added and published through the admin dashboard.</p>
              </div>

              <div className="brand-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Catalogue</h3>
                  <span className="text-sm text-slate-500">Categories</span>
                </div>
                {catalogueError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{catalogueError}</div> : null}
                {publishedProducts.length && categories.length ? (
                  <div className="space-y-8">
                    {publishedProducts.filter((product) => product.show_home !== false).length ? (
                      <section className="rounded-[1.5rem] bg-white/70 p-3">
                        <div className="mb-3">
                          <h4 className="text-lg font-semibold text-slate-900">Featured on Home</h4>
                          <p className="text-sm text-[var(--muted)]">A curated view of the latest AURA essentials.</p>
                        </div>
                        <ProductShowcase products={publishedProducts.filter((product) => product.show_home !== false)} />
                      </section>
                    ) : null}
                    {categories.map((category) => (
                      <ProductCategorySection
                        key={category.id}
                        category={category}
                        products={productsByCategory.get(category.id) ?? []}
                        theme={showcaseSettings.find((setting) => setting.category_id === category.id)?.theme ?? category.slug}
                        settings={showcaseSettings.find((setting) => setting.category_id === category.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--color-very-light)] p-8 text-center text-sm text-[var(--muted)]">No published products yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell">
          <div className="mb-10 text-center">
            <div className="eyebrow mx-auto">Collections</div>
            <h2 className="section-heading">Premium workwear, built for daily wear.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {AURA_COLLECTIONS.map((collection) => (
              <article key={collection.name} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[rgba(38,48,42,0.08)] bg-white shadow-[0_12px_30px_rgba(38,48,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(38,48,42,0.08)]">
                <img src={collection.image} alt={collection.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-semibold text-[var(--color-charcoal)]">{collection.name}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Price range: {collection.price}</p>
                  <div className="mt-auto pt-5">
                    <WhatsAppButton url={APP_INFO.aura.whatsappUrl} label="Enquire on WhatsApp" className="w-full" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-[var(--color-ivory)] py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="eyebrow">About</div>
            <h2 className="section-heading">AURA UNIFORM, designed for everyday performance.</h2>
          </div>
          <div className="text-lg leading-8 text-slate-700">
            AURA UNIFORM brings together smart design, practical comfort, and dependable quality for workwear and everyday essentials. From uniforms and winter layers to plain essentials, every product is built to support daily performance while keeping the finish clean, premium, and consistent.
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell">
          <div className="mb-10 text-center">
            <div className="eyebrow mx-auto">Testimonials</div>
            <h2 className="section-heading">What our clients are saying.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="brand-card">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{item.name}</div>
                <p className="text-lg leading-8 text-[var(--color-charcoal)]">“{item.quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-20">
        <div className="container-shell">
          <div className="mb-10 text-center">
            <div className="eyebrow mx-auto">Contact</div>
            <h2 className="section-heading">Let’s build your next uniform requirement.</h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="brand-card">
              <h3 className="text-2xl font-semibold text-[var(--color-charcoal)]">AURA UNIFORM</h3>
              <div className="mt-6 space-y-4 text-[var(--muted)]">
                <div className="flex items-center gap-3"><Phone size={16} className="text-[var(--color-charcoal)]" /> <a href={`tel:${APP_INFO.aura.phone.replace(/\s/g, '')}`} className="hover:text-[var(--color-charcoal)]">{APP_INFO.aura.phone}</a></div>
                <div className="flex items-center gap-3"><Mail size={16} className="text-[var(--color-charcoal)]" /> <a href={`mailto:${APP_INFO.aura.email}`} className="hover:text-[var(--color-charcoal)]">{APP_INFO.aura.email}</a></div>
                <div className="flex items-center gap-3"><MapPin size={16} className="text-[var(--color-charcoal)]" /> {APP_INFO.aura.address}</div>
                <div className="flex items-center gap-3"><img src="/whatsapp.svg" alt="" className="h-4 w-4" /> <a href={APP_INFO.aura.whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--color-charcoal)]">WhatsApp AURA</a></div>
              </div>
              <div className="mt-6"><WhatsAppButton url={APP_INFO.aura.whatsappUrl} label="WhatsApp AURA" /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCategorySection({ category, products, theme, settings }: { category: Category; products: Product[]; theme: string; settings?: ShowcaseSettings }) {
  if (!products.length || settings?.visible === false) return null;

  return (
    <section id={`category-${category.slug}`} style={{ backgroundColor: settings?.background }} className={`scroll-mt-28 overflow-hidden rounded-[1.5rem] p-4 sm:p-5 ${settings?.background ? '' : theme === 'winter' ? 'bg-[#edf3f7]' : theme === 'plain-t-shirt' ? 'bg-[#f5f0e9]' : 'bg-[#edf4eb]'}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{settings?.title || category.name}</h4>
          <p className="mt-1 text-sm text-[var(--muted)]">{settings?.subtitle || category.description || 'Curated essentials for every season.'}</p>
        </div>
      </div>
      <ProductShowcase products={products} theme={theme} settings={settings} />
    </section>
  );
}

function ProductShowcase({ products, theme, settings }: { products: Product[]; theme?: string; settings?: ShowcaseSettings }) {
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
  }, [products]);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startRotation: number } | null>(null);
  const step = 360 / uniqueProducts.length;
  const radius = Math.max(180, Math.min(330, uniqueProducts.length * 68));
  const active = ((Math.round(-rotation / step) % uniqueProducts.length) + uniqueProducts.length) % uniqueProducts.length;
  const snap = (direction: number) => setRotation((current) => Math.round(current / step) * step + direction * step);

  useEffect(() => {
    setRotation(0);
    setDragging(false);
    dragRef.current = null;
  }, [uniqueProducts]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (uniqueProducts.length < 2 || (event.target as HTMLElement).closest('a, button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startRotation: rotation };
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    setRotation(dragRef.current.startRotation + (event.clientX - dragRef.current.startX) * 0.45);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    setRotation((current) => Math.round(current / step) * step);
  };

  if (uniqueProducts.length === 1) return <div className="mx-auto max-w-sm"><ProductCard product={uniqueProducts[0]} accent={settings?.accent} /></div>;

  return (
    <div
      className={`relative mx-auto max-w-5xl ${theme || ''}`}
      style={{ '--showcase-accent': settings?.accent || 'var(--brand-dark)' } as React.CSSProperties}
    >
      <div className="grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
        <button type="button" onClick={() => snap(1)} className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--color-charcoal)] shadow-sm transition hover:-translate-x-1 md:inline-flex" aria-label="Previous product"><ArrowLeft size={17} /></button>
        <div
          className="relative min-h-[31rem] touch-pan-y sm:min-h-[30rem]"
          style={{ perspective: '1200px' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {uniqueProducts.map((product, index) => {
            const angle = index * step + rotation;
            const radians = angle * Math.PI / 180;
            const depth = (Math.cos(radians) + 1) / 2;
            return (
              <div
                key={product.id}
                className="absolute left-1/2 top-0 w-full max-w-sm"
                style={{
                  transform: `translateX(-50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  opacity: depth < 0.08 ? 0 : 0.28 + depth * 0.72,
                  zIndex: Math.round(depth * 100),
                  transition: dragging ? 'none' : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms ease',
                  pointerEvents: depth > 0.55 ? 'auto' : 'none',
                }}
              >
                <ProductCard product={product} accent={settings?.accent} />
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => snap(-1)} className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--color-charcoal)] shadow-sm transition hover:translate-x-1 md:inline-flex" aria-label="Next product"><ChevronRight size={17} /></button>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {uniqueProducts.map((product, index) => <button key={product.id} type="button" onClick={() => setRotation(-index * step)} className={`h-2 rounded-full transition-all ${index === active ? 'w-7 bg-[var(--showcase-accent)]' : 'w-2 bg-[var(--line)]'}`} aria-label={`Show ${product.name}`} />)}
      </div>
    </div>
  );
}
