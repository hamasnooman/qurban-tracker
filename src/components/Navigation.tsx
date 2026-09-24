'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Receipt,
  Share2,
  Users,
  Settings,
  Sun,
  Moon,
  ShieldAlert,
  ShieldCheck,
  User,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { AdminLoginModal } from './AdminLoginModal';

export function Navigation() {
  const pathname = usePathname();
  const { currentUser, logoutToUserView, theme, toggleTheme, isSupabase } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const isAdminOrSub = currentUser.role === 'main_admin' || currentUser.role === 'sub_admin';

  const navItems = [
    { href: '/', label: 'Summary & Accounts', icon: LayoutDashboard },
    { href: '/tracker', label: '51-Week Grid', icon: CalendarDays },
    ...(isAdminOrSub ? [{ href: '/payments/add', label: '+ Add Payment', icon: PlusCircle, highlight: true }] : []),
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'main_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Main Admin
          </span>
        );
      case 'sub_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Sub Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <User className="w-3 h-3 text-stone-500" />
            User View
          </span>
        );
    }
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#111622] border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-30 shadow-sm">
        {/* Logo and Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                  Qurban Fund
                </span>
                <span className="text-sm">🐄</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                2026/27 · 4 Families
              </p>
            </div>
          </Link>

          {/* Connection status indicator */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isSupabase ? 'Supabase Live' : 'Demo Local Mode'}
            </span>
            <span className="font-mono text-[10px] text-slate-400">Asia/Colombo</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) && item.href !== '/';
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info & Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          {/* User Status / Admin Sign In */}
          {isAdminOrSub ? (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800/60 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </span>
                {getRoleBadge(currentUser.role)}
              </div>
              <button
                onClick={logoutToUserView}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Return to User View (Read Only)"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Exit to User View</span>
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  User View
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Complete Review
                </span>
              </div>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Sign In</span>
              </button>
            </div>
          )}

          {/* Theme Toggle & Meta */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-400">v1.0 (2026/27)</span>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#111622]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-300 flex items-center justify-center text-sm shadow">
            🌙
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1">
              Qurban 2026/27 <span>🐄</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
              {isAdminOrSub ? currentUser.name : 'Complete Review Summary'}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdminOrSub ? (
            <button
              onClick={logoutToUserView}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
              title="Exit to User View"
            >
              <LogOut className="w-3 h-3 text-slate-400" />
              <span>Exit</span>
            </button>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95"
            >
              <KeyRound className="w-3 h-3 text-amber-300" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu (When user clicks Hamburger) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm pt-14">
          <div className="bg-white dark:bg-[#111622] h-full max-w-xs ml-auto p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Menu Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4 text-emerald-600" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Admin Portal in Mobile Drawer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 mb-2">Admin Portal</div>
                {isAdminOrSub ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate pr-2">
                        {currentUser.name}
                      </span>
                      {getRoleBadge(currentUser.role)}
                    </div>
                    <button
                      onClick={() => {
                        logoutToUserView();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exit to User View (Read Only)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                    <span>Sign In as Admin / Sub Admin</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center py-2">
              Jazakallahu Khairan 🤲 · #QurbanFamily2027
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#111622]/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-xs font-medium transition-colors ${
            pathname === '/'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Summary</span>
        </Link>

        {/* Center Prominent Add Button: ONLY for Main Admin (Mr. Hamas) and Sub Admin (Nihla) */}
        {isAdminOrSub && (
          <Link
            href="/payments/add"
            className="flex flex-col items-center -mt-6"
            title="Add Payment"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-transform">
              <PlusCircle className="w-6 h-6 text-amber-300" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
              Add
            </span>
          </Link>
        )}

        <Link
          href="/tracker"
          className={`flex flex-col items-center py-1 px-4 rounded-xl text-xs font-medium transition-colors ${
            pathname === '/tracker'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span>51-Week Grid</span>
        </Link>
      </nav>
    </>
  );
}
