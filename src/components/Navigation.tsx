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
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const { currentUser, switchUser, users, theme, toggleTheme, isSupabase } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tracker', label: 'Weekly Tracker', icon: CalendarDays },
    { href: '/payments/add', label: 'Add Payment', icon: PlusCircle, highlight: true },
    { href: '/payments', label: 'All Payments', icon: Receipt },
    { href: '/weekly-card', label: 'Weekly Card', icon: Share2 },
    { href: '/family/fam-nooman', label: 'Family Statement', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <User className="w-3 h-3 text-blue-600" />
            Family View
          </span>
        );
    }
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 h-screen sticky top-0 z-30 shadow-sm">
        {/* Logo and Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-300 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-stone-900 dark:text-white tracking-tight">
                  Qurban Fund
                </span>
                <span className="text-sm">🐄</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                2026/27 · 4 Families
              </p>
            </div>
          </Link>

          {/* Connection status indicator */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/60 px-2.5 py-1 rounded-md border border-stone-200/60 dark:border-stone-700/60">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isSupabase ? 'Supabase Live' : 'Demo Local Mode'}
            </span>
            <span className="font-mono text-[10px] text-stone-400">Asia/Colombo</span>
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
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-amber-300' : 'text-stone-400 dark:text-stone-500'
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
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 space-y-3">
          {/* User selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-emerald-500 transition-colors text-left"
            >
              <div className="flex flex-col truncate pr-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {currentUser.name}
                </span>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 p-1.5 z-50 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-stone-400 tracking-wider uppercase">
                  Switch Active Role
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950/70 dark:text-emerald-200'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[10px] text-stone-400">{u.role.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle & Meta */}
          <div className="flex items-center justify-between pt-1 text-xs text-stone-500 dark:text-stone-400">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-stone-400">v1.0 (2026/27)</span>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-300 flex items-center justify-center text-sm shadow">
            🌙
          </div>
          <div>
            <div className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1">
              Qurban 2026/27 <span>🐄</span>
            </div>
            <div className="text-[10px] text-stone-500">{currentUser.name}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {getRoleBadge(currentUser.role)}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu (When user clicks Hamburger) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm pt-14">
          <div className="bg-white dark:bg-stone-900 h-full max-w-xs ml-auto p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-900 dark:text-white">Menu Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600"
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4 text-emerald-600" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Role Switcher in Mobile Drawer */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="text-xs font-semibold text-stone-500 mb-2">Switch Active User</div>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                        u.id === currentUser.id
                          ? 'bg-emerald-100 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span>{u.name}</span>
                      <span>{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 text-center py-2">
              Jazakallahu Khairan 🤲 · #QurbanFamily2027
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-t border-stone-200 dark:border-stone-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            pathname === '/'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/tracker"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            pathname === '/tracker'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span>Tracker</span>
        </Link>

        {/* Center Prominent Add Button */}
        <Link
          href="/payments/add"
          className="flex flex-col items-center -mt-5"
          title="Add Payment"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 text-amber-300" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
            Add
          </span>
        </Link>

        <Link
          href="/weekly-card"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            pathname === '/weekly-card'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Share2 className="w-5 h-5 mb-0.5" />
          <span>Card</span>
        </Link>

        <Link
          href="/payments"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            pathname.startsWith('/payments') && pathname !== '/payments/add'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Payments</span>
        </Link>
      </nav>
    </>
  );
}
