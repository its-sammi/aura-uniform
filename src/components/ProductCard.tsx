import { IndianRupee } from 'lucide-react';
import { Product } from '../types';
import { getWhatsAppUrl } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  accent?: string;
}

export default function ProductCard({ product, accent }: ProductCardProps) {
  const image = product.images?.[0]?.url;
  const businessPhone = '+91 8272016950';

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(38,48,42,0.14)]" style={{ borderColor: accent || 'rgb(226 232 240)' }}>
      <div className="relative overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={product.name} width="640" height="512" className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-500">No image uploaded</div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {product.category?.name || 'Collection'}
          </span>
          {product.featured && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Featured</span>}
        </div>
        {product.badges?.length ? <div className="flex flex-wrap gap-2">{product.badges.map((badge) => <span key={badge} className="rounded-full bg-[var(--color-very-light)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)]">{badge}</span>)}</div> : null}

        <div>
          <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{product.brand_name || product.business?.name || 'AURA UNIFORM'}</p>
        </div>

        {product.price && (
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <IndianRupee size={16} />
            {product.price.toLocaleString('en-IN')}
          </div>
        )}

        <div className="pt-2">
          <a
            href={getWhatsAppUrl(businessPhone, `Hello, I am interested in ${product.name}. Please share more details.`)}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-button shine-effect w-full px-4 py-2.5"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
          >
            <img src="/whatsapp.svg" alt="" className="whatsapp-mark" />
          </a>
        </div>
      </div>

    </article>
  );
}
