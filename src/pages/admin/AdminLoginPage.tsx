import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const userId = data.user?.id;
      if (!userId) throw new Error('User not found.');

      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('user_id, role')
        .eq('user_id', userId)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized for the admin dashboard.');
      }

      navigate('/vijay');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e2f0e6_0%,_#d9ece0_46%,_#d2e8d9_100%)] px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-[1.25rem] border border-[rgba(67,101,78,0.16)] bg-[var(--panel)] p-6 shadow-[0_18px_44px_rgba(38,48,42,0.08)] sm:p-8">
        <div className="mb-6">
          <img src="/aura-logo.jpe" alt="AURA UNIFORM logo" className="mb-5 h-20 w-20 rounded-full bg-white object-contain p-1 shadow-sm" />
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">ADMIN ACCESS</div>
          <h1 className="section-heading text-4xl">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--color-charcoal)]">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[rgba(67,101,78,0.2)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--cta-mid)] focus:ring-2 focus:ring-[rgba(0,117,107,0.16)]" placeholder="admin@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--color-charcoal)]">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[rgba(67,101,78,0.2)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--cta-mid)] focus:ring-2 focus:ring-[rgba(0,117,107,0.16)]" placeholder="••••••••" />
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-[linear-gradient(105deg,#016967_0%,#00756B_28%,#008471_52%,#048D74_74%,#31AA76_100%)] px-5 py-3 font-semibold text-white shadow-[0_12px_26px_var(--cta-shadow)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,117,107,0.24)]">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
