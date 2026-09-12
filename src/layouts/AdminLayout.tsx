import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban, Tags, ImageIcon, Settings, PanelsTopLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { to: '/vijay', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vijay/products', label: 'Products', icon: FolderKanban },
  { to: '/vijay/categories', label: 'Categories', icon: Tags },
  { to: '/vijay/images', label: 'Images', icon: ImageIcon },
  { to: '/vijay/settings', label: 'Business Settings', icon: Settings },
  { to: '/vijay/showcase', label: 'Showcase Manager', icon: PanelsTopLeft },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/vijay/login');
  };

  return (
    <div className="admin-theme min-h-screen bg-[var(--section)] text-[var(--color-charcoal)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-[var(--line)] bg-[linear-gradient(180deg,#789E78_0%,#4E745D_100%)] text-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <img src="/aura-logo.jpe" alt="AURA UNIFORM logo" className="mb-4 h-14 w-14 rounded-full bg-white object-contain p-1" />
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#dfe9df]">Admin</div>
              <div className="text-xl font-semibold">Control Center</div>
            </div>
          </div>
          <nav className="space-y-1 px-3 pb-6">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-white/15 text-white shadow-sm' : 'text-[#edf5ed] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button type="button" onClick={handleLogout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#edf5ed] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dce9d8]">
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
