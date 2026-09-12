import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">404</div>
        <h1 className="mt-4 text-5xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-lg text-slate-600">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
