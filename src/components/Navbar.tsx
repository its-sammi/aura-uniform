import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../data/content';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/60 backdrop-blur-sm" style={{ borderColor: 'var(--line)' }}>
      <div className="container-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-4" aria-label="AURA UNIFORM home">
          <img src="/aura-logo.jpe" alt="AURA UNIFORM logo" className="h-12 w-12 rounded-full bg-white object-contain shadow-sm md:h-14 md:w-14" />
          <div>
            <div className="text-sm font-semibold tracking-[0.14em] text-[var(--color-charcoal)]">AURA UNIFORM</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--color-charcoal)]">{item.label}</a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white text-[var(--color-charcoal)] md:hidden"
          onClick={() => setOpen((s) => !s)}
          style={{ borderColor: 'var(--line)' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="bg-white md:hidden" style={{ borderTop: '1px solid var(--line)' }}>
          <nav className="container-shell flex flex-col py-4" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b py-3 text-base font-medium text-[var(--color-charcoal)] last:border-b-0"
                style={{ borderColor: 'var(--line)' }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
