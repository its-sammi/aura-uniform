import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!isSupabaseConfigured) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('user_id, role')
        .eq('user_id', userId)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle();

      if (active) {
        setAuthorized(!error && Boolean(data));
        setChecking(false);
      }
    };

    verify();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;
      if (!userId) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      supabase
        .from('admin_profiles')
        .select('user_id, role')
        .eq('user_id', userId)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle()
        .then(({ data, error }) => {
          if (active) {
            setAuthorized(!error && Boolean(data));
            setChecking(false);
          }
        });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Checking access…</div>;
  }

  if (!authorized) {
    return <Navigate to="/vijay/login" replace />;
  }

  return <Outlet />;
}
