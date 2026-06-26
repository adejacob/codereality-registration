'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, LogOut, ShieldCheck, Menu,
  ChevronRight, Bell, Tag, X, BookOpen, CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { href: '/admin',               label: 'Dashboard',      icon: LayoutDashboard, badge: null },
  { href: '/admin/registrations', label: 'Registrations',  icon: Users,           badge: null },
  { href: '/admin/coupons',       label: 'Coupons',        icon: Tag,             badge: null },
  { href: '/admin/programs',      label: 'Programs',       icon: BookOpen,        badge: null },
  { href: '/admin/plans',         label: 'Plans',          icon: CreditCard,      badge: null },
];

const BREADCRUMBS: Record<string, string> = {
  '/admin':               'Dashboard',
  '/admin/registrations': 'Registrations',
  '/admin/coupons':       'Coupons',
  '/admin/programs':      'Programs',
  '/admin/plans':         'Plans',
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
    <div className="min-h-screen flex" style={{ backgroundColor: '#FCF3E8' }}>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      {/* Desktop: always-visible sticky sidebar that takes up space in the flex row */}
      {/* Mobile: slide-in overlay */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen w-64 flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen
        `}
        style={{ backgroundColor: '#1F2937', borderRight: '1px solid rgba(215,119,6,0.15)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
      >
        {/* Brand */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(215,119,6,0.15)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 12px rgba(215,119,6,0.3)' }}>
                <Image
                  src="/title-logo.jpeg"
                  alt="Codereality Academy"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <p className="font-black text-sm tracking-tight leading-tight" style={{ color: '#FFFFFF' }}>Codereality</p>
                <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#D97706' }}>Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'rgba(215,119,6,0.5)' }}>Navigation</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={active
                  ? { backgroundColor: 'rgba(215,119,6,0.15)', color: '#FFFFFF', border: '1px solid rgba(215,119,6,0.25)' }
                  : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
                }
              >
                <span
                  className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
                  style={active ? { backgroundColor: 'rgba(215,119,6,0.25)', color: '#D97706' } : { color: 'rgba(255,255,255,0.35)' }}
                >
                  <Icon size={16} />
                </span>
                {label}
                {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#D97706' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(215,119,6,0.15)' }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#D97706' }}>
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>Administrator</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(215,119,6,0.6)' }}>Codereality Academy</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#15803D' }} />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(220,38,38,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <span className="flex-shrink-0 p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <LogOut size={16} />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Desktop sidebar spacer — keeps main content from going under the fixed sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-10" style={{ borderBottom: '1px solid #E7DCCB', boxShadow: '0 1px 8px rgba(215,119,6,0.07)' }}>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl transition-colors flex-shrink-0"
            style={{ color: '#6B7280' }}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="hidden sm:block" style={{ color: '#9CA3AF' }}>Admin</span>
            <ChevronRight size={14} className="hidden sm:block flex-shrink-0" style={{ color: '#D97706' }} />
            <span className="font-bold truncate" style={{ color: '#1F2937' }}>{pageTitle}</span>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl transition-colors" style={{ color: '#9CA3AF' }}>
              <Bell size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid #E7DCCB' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#D97706' }}>
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold leading-tight" style={{ color: '#1F2937' }}>Admin</p>
                <p className="text-xs leading-tight" style={{ color: '#9CA3AF' }}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#FCF3E8' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
