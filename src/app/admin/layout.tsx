'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, LogOut, ShieldCheck, Menu,
  ChevronRight, Bell, Tag,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin',               label: 'Dashboard',      icon: LayoutDashboard, badge: null },
  { href: '/admin/registrations', label: 'Registrations',  icon: Users,           badge: null },
  { href: '/admin/coupons',        label: 'Coupons',        icon: Tag,             badge: null },
];

const BREADCRUMBS: Record<string, string> = {
  '/admin':               'Dashboard',
  '/admin/registrations': 'Registrations',
  '/admin/coupons':       'Coupons',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  const pageTitle = BREADCRUMBS[pathname] ?? 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900
          border-r border-white/5 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight leading-tight">Codereality</p>
              <p className="text-indigo-300/60 text-[10px] font-semibold uppercase tracking-[2px]">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-white/25 uppercase tracking-[2px]">Navigation</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-indigo-500/20 text-white border border-indigo-400/20 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                  }`}
              >
                <span className={`flex-shrink-0 p-1.5 rounded-lg transition-colors
                  ${active ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/40 group-hover:text-white/80'}`}>
                  <Icon size={16} />
                </span>
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-indigo-400/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Administrator</p>
              <p className="text-white/40 text-[10px] truncate">Codereality Academy</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/15 hover:text-red-300 transition-all duration-150 group"
          >
            <span className="flex-shrink-0 p-1.5 rounded-lg text-white/30 group-hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-gray-400 hidden sm:block">Admin</span>
            <ChevronRight size={14} className="text-gray-300 hidden sm:block flex-shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{pageTitle}</span>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">Admin</p>
                <p className="text-xs text-gray-400 leading-tight">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
