'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import Link from 'next/link';
import { LayoutDashboard, Library, Landmark, Users, HelpCircle, ArrowLeft, ShieldCheck, Coins, Ticket, Handshake, ShoppingBag, ShoppingCart, Newspaper, FileText } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // Role & Page Gating
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'translator' && user.role !== 'novel_creator') {
        router.push('/');
        return;
      }

      // Check permissions dynamically
      if (user.role !== 'admin') {
        if (pathname === '/admin') {
          if (!user.permissions?.includes('dashboard') && !user.permissions?.includes('creator_dashboard')) {
            // Redirect to first available page
            if (user.permissions?.includes('series')) {
              router.push('/admin/series');
            } else if (user.permissions?.includes('novels_management')) {
              router.push('/admin/novels');
            } else if (user.permissions?.includes('sponsors')) {
              router.push('/admin/sponsors');
            } else {
              router.push('/');
            }
          }
        } else {
          const routesPermissions: Record<string, string> = {
            '/admin/topup-requests': 'topup_requests',
            '/admin/series': 'series',
            '/admin/packages': 'packages',
            '/admin/users': 'users',
            '/admin/coupons': 'coupons',
            '/admin/sponsors': 'sponsors',
            '/admin/books': 'books',
            '/admin/orders': 'orders',
            '/admin/permissions': 'permissions',
            '/admin/novels': 'novels_management',
            '/admin/creator-purchases': 'creator_topups',
            '/admin/creator-cards': 'creator_payment_methods',
            '/admin/applications/novel-creators': 'users',
          };

          const matchedRoute = Object.keys(routesPermissions).find(route => pathname.startsWith(route));
          if (matchedRoute) {
            const requiredPermission = routesPermissions[matchedRoute];
            if (!user.permissions?.includes(requiredPermission)) {
              if (user.permissions?.includes('series')) {
                router.push('/admin/series');
              } else if (user.permissions?.includes('novels_management')) {
                router.push('/admin/novels');
              } else if (user.permissions?.includes('sponsors')) {
                router.push('/admin/sponsors');
              } else {
                router.push('/');
              }
            }
          }
        }
      }
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  // Double check role
  if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'translator' && user.role !== 'novel_creator')) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* 1. Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/40 hidden md:flex flex-col flex-shrink-0">
        {/* Header Title */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
            ecliptoon Admin
          </span>
        </div>

        {/* Sidebar Links Grouped */}
        <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {[
            {
              title: 'Asosiy',
              items: [
                { href: '/admin', label: t('adminPanel.dashboard'), icon: LayoutDashboard, permission: user.role === 'novel_creator' ? 'creator_dashboard' : 'dashboard' },
                { href: '/admin/news', label: 'Yangiliklar', icon: Newspaper, permission: 'dashboard' },
                { href: '/admin/permissions', label: 'Rollar (Permissions)', icon: ShieldCheck, permission: 'permissions' },
              ]
            },
            {
              title: 'Manhwa boshqaruvi',
              items: [
                { href: '/admin/series', label: t('adminPanel.seriesManagement'), icon: Library, permission: 'series' },
                { href: '/admin/topup-requests', label: t('adminPanel.pendingRequests'), icon: Landmark, permission: 'topup_requests' },
                { href: '/admin/packages', label: t('adminPanel.packagesManagement'), icon: Coins, permission: 'packages' },
              ]
            },
            {
              title: 'Novel boshqaruvi',
              items: [
                { href: '/admin/novels', label: 'Novellalar', icon: Library, permission: 'novels_management' },
                { href: '/admin/creator-purchases', label: 'Xarid arizalari', icon: FileText, permission: 'creator_topups' },
                { href: '/admin/creator-cards', label: 'Mening kartalarim', icon: Coins, permission: 'creator_payment_methods' },
              ]
            },
            {
              title: 'Ma\'muriyat',
              items: [
                { href: '/admin/users', label: t('adminPanel.usersManagement'), icon: Users, permission: 'users' },
                { href: '/admin/applications/novel-creators', label: 'Creator Arizalari', icon: FileText, permission: 'users' },
                { href: '/admin/applications', label: 'Tarjimon arizalari', icon: FileText, permission: 'users' },
              ]
            },
            {
              title: 'Do\'kon boshqaruvi',
              items: [
                { href: '/admin/books', label: t('adminPanel.booksManagement'), icon: ShoppingBag, permission: 'books' },
                { href: '/admin/orders', label: t('adminPanel.ordersManagement'), icon: ShoppingCart, permission: 'orders' },
                { href: '/admin/coupons', label: t('adminPanel.couponManagement'), icon: Ticket, permission: 'coupons' },
                { href: '/admin/sponsors', label: t('adminPanel.sponsorManagement'), icon: Handshake, permission: 'sponsors' },
              ]
            }
          ].map((group) => {
            const filteredItems = group.items.filter(item => user.permissions?.includes(item.permission));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="space-y-0.5 pt-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-violet-600/10 text-violet-400 border-l-4 border-violet-500 pl-2.5 pr-3 rounded-r-xl'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/40 px-3 rounded-xl'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Back link */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl text-xs font-bold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Platformaga qaytish</span>
          </Link>
        </div>
      </aside>

      {/* 2. Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-slate-900/20 px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
          {/* Mobile Navigation (Scrollable horizontally) */}
          <div className="md:hidden flex items-center overflow-x-auto w-full gap-4 pr-4 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {user.role === 'admin' && (
              <Link href="/admin" className="font-extrabold text-sm tracking-wider uppercase text-red-400 flex-shrink-0">
                Admin
              </Link>
            )}
            {user.role === 'moderator' && (
              <span className="font-extrabold text-sm tracking-wider uppercase text-violet-400 flex-shrink-0">
                Moderator
              </span>
            )}
            {user.role === 'translator' && (
              <span className="font-extrabold text-sm tracking-wider uppercase text-blue-400 flex-shrink-0">
                Translator
              </span>
            )}

            {/* Render all permitted links dynamically */}
            {[
              { href: '/admin', label: t('adminPanel.dashboard'), permission: user.role === 'novel_creator' ? 'creator_dashboard' : 'dashboard' },
              { href: '/admin/topup-requests', label: t('adminPanel.pendingRequests'), permission: 'topup_requests' },
              { href: '/admin/series', label: t('adminPanel.seriesManagement'), permission: 'series' },
              { href: '/admin/novels', label: 'Novellalar', permission: 'novels_management' },
              { href: '/admin/creator-purchases', label: 'Xarid arizalari', permission: 'creator_topups' },
              { href: '/admin/creator-cards', label: 'Mening kartalarim', permission: 'creator_payment_methods' },
              { href: '/admin/applications/novel-creators', label: 'Creator Arizalari', permission: 'users' },
              { href: '/admin/packages', label: t('adminPanel.packagesManagement'), permission: 'packages' },
              { href: '/admin/users', label: t('adminPanel.usersManagement'), permission: 'users' },
              { href: '/admin/coupons', label: t('adminPanel.couponManagement'), permission: 'coupons' },
              { href: '/admin/sponsors', label: t('adminPanel.sponsorManagement'), permission: 'sponsors' },
              { href: '/admin/books', label: t('adminPanel.booksManagement'), permission: 'books' },
              { href: '/admin/orders', label: t('adminPanel.ordersManagement'), permission: 'orders' },
              { href: '/admin/applications', label: 'Tarjimon arizalari', permission: 'users' },
              { href: '/admin/news', label: 'Yangiliklar', permission: 'dashboard' },
              { href: '/admin/permissions', label: 'Rollar', permission: 'permissions' },
            ].filter((item) => user.permissions?.includes(item.permission)).map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-semibold whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-lg ${
                    isActive ? 'bg-violet-500/20 text-violet-400' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link href="/" className="text-xs text-red-400 font-bold whitespace-nowrap flex-shrink-0 px-2">
              Chiqish
            </Link>
          </div>

          {/* Desktop Navigation Info */}
          <div className="hidden md:flex items-center w-full justify-between">
            <div className="text-xs text-slate-400">
              Hush kelibsiz, <span className="font-bold text-slate-200">{user.name}</span> ({user.role})
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
              Nazorat rejimi (Admin Mode)
            </div>
          </div>
        </header>

        {/* Main Panel Content */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
