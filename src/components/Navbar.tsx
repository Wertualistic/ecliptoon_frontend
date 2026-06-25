'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useCart } from '@/context/CartContext';
import { Menu, X, Coins, Bookmark, UserRound, ShieldAlert, LogOut, Search, Compass, BookOpen, Trophy, ShoppingBag, ShoppingCart, ChevronDown, Newspaper } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="glass-header sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="ecliptoon logo" className="w-10 h-10 object-cover rounded-full group-hover:scale-105 transition-transform" />
              <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                {t('common.appName')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center xl:space-x-4 space-x-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/') ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {t('common.home')}
            </Link>
            
            {/* Explore Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                (isActive('/catalog') || isActive('/search') || isActive('/leaderboard') || isActive('/shop') || isActive('/news')) ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}>
                <Compass className="w-4 h-4" />
                Kashf qilish
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              
              <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-slate-900 border border-white/10 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/translators" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <UserRound className="w-4 h-4 text-pink-400" />
                    Tarjimonlar
                  </Link>
                  <Link href="/news" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Newspaper className="w-4 h-4 text-blue-400" />
                    Yangiliklar
                  </Link>
                  <Link href="/catalog" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    {t('common.catalog')}
                  </Link>
                  <Link href="/search" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Search className="w-4 h-4 text-slate-400" />
                    {t('common.search')}
                  </Link>
                  <Link href="/leaderboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    {t('common.leaderboard')}
                  </Link>
                  <Link href="/shop" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <ShoppingBag className="w-4 h-4 text-violet-400" />
                    {t('shop.title')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center xl:space-x-4 space-x-2">
            {isAuthenticated && user ? (
              <>
                {/* Admin button if role matches */}
                {(user.role === 'admin' || user.role === 'moderator' || user.role === 'translator') && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 bg-red-950/60 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap hover:bg-red-900/50 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t('common.admin')}
                  </Link>
                )}

                {/* Shopping Cart / Basket */}
                {cartCount > 0 && (
                  <Link
                    href="/shop/basket"
                    className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                    title={t('shop.basket') || "Savat"}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{cartCount}</span>
                  </Link>
                )}

                {/* Diamonds balance */}
                <Link
                  href="/dashboard/buy-diamonds"
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Coins className="w-4 h-4 text-amber-400 animate-pulse-glow" />
                  <span className="flex items-center gap-1">{user.diamond_balance} <StrawberryIcon /></span>
                </Link>

                {/* Library Bookmarks */}
                <Link
                  href="/dashboard/library"
                  className={`p-2 rounded-full transition-colors ${
                    isActive('/dashboard/library') ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                  title={t('common.library')}
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* Dashboard / Profile */}
                <Link
                  href="/dashboard"
                  className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                    isActive('/dashboard') ? 'text-violet-400 bg-violet-500/10 ring-2 ring-violet-500' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                  title={t('common.profile')}
                >
                  {user.avatar_url ? (
                    <img 
                      src={`${API_URL.replace(/\/api$/, '')}/storage/${user.avatar_url}`} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-5 h-5" />
                  )}
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800/40 transition-colors cursor-pointer"
                  title={t('common.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Shopping Cart / Basket (Unauthenticated) */}
                {cartCount > 0 && (
                  <Link
                    href="/shop/basket"
                    className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                    title={t('shop.basket') || "Savat"}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{cartCount}</span>
                  </Link>
                )}

                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Shopping Cart */}
            {cartCount > 0 && (
              <Link
                href="/shop/basket"
                className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2.5 py-1 rounded-full text-xs font-bold"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{cartCount}</span>
              </Link>
            )}

            {isAuthenticated && user && (
              <Link
                href="/dashboard/buy-diamonds"
                className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{user.diamond_balance} <StrawberryIcon /></span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-md hover:bg-slate-800/40"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-header border-t border-white/5 px-2 pt-2 pb-4 space-y-1 animate-slide-down">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <BookOpen className="w-5 h-5 text-blue-400" />
            {t('common.home')}
          </Link>
          <Link
            href="/translators"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <UserRound className="w-5 h-5 text-pink-400" />
            Tarjimonlar
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <Newspaper className="w-5 h-5 text-blue-400" />
            Yangiliklar
          </Link>
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <Compass className="w-5 h-5 text-emerald-400" />
            {t('common.catalog')}
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <Search className="w-5 h-5" />
            {t('common.search')}
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <Trophy className="w-5 h-5 text-violet-400" />
            {t('common.leaderboard')}
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            {t('shop.title')}
          </Link>

          {isAuthenticated && user ? (
            <>
              <div className="border-t border-white/5 my-2 pt-2"></div>
              
              {(user.role === 'admin' || user.role === 'moderator' || user.role === 'translator') && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-red-300 hover:bg-red-900/20"
                >
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  {t('common.admin')}
                </Link>
              )}

              <Link
                href="/dashboard/library"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <Bookmark className="w-5 h-5 text-slate-400" />
                {t('common.library')}
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                {user.avatar_url ? (
                  <img 
                    src={`${API_URL.replace(/\/api$/, '')}/storage/${user.avatar_url}`} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="w-5 h-5 text-slate-400" />
                )}
                {t('common.profile')}
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-red-400 hover:bg-red-950/20 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                {t('common.logout')}
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-white/5 my-2 pt-2"></div>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                {t('common.login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-3 py-2 rounded-md text-base font-medium shadow-md shadow-violet-500/10"
              >
                {t('common.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

