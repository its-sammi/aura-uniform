import { Mail, MapPin, MessageCircleMore, Phone } from 'lucide-react';
import { APP_INFO } from '../data/content';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--color-charcoal)] text-slate-200">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3">
        <div>
          <img src="/aura-logo.jpe" alt="AURA UNIFORM logo" className="mb-5 h-16 w-16 rounded-full bg-white object-contain p-1" />
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">AURA</div>
          <h3 className="text-2xl font-semibold text-white">Premium workwear solutions</h3>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Navigation</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><a href="/#home" className="hover:text-white">Home</a></li>
            <li><a href="/#aura" className="hover:text-white">AURA Uniform</a></li>
            <li><a href="/#about" className="hover:text-white">About</a></li>
            <li><a href="/#contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Contact</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <a href={`tel:${APP_INFO.aura.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white"><Phone size={16} /> {APP_INFO.aura.phone}</a>
            <a href={`mailto:${APP_INFO.aura.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={16} /> {APP_INFO.aura.email}</a>
            <a href={APP_INFO.aura.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircleMore size={16} /> Facebook</a>
            <div className="flex items-center gap-2"><MapPin size={16} /> {APP_INFO.aura.address}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col justify-between gap-3 py-5 text-sm text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} AURA UNIFORM.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
