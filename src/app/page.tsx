'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { HAMAS_BANK_ACCOUNTS } from '@/lib/mock-data';
import {
  formatCurrency,
  formatDisplayDate,
  getDaysUntilEid,
  getWeeksDue,
} from '@/lib/calculations';
import {
  AlertTriangle,
  PlusCircle,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  KeyRound,
  ArrowRight,
  TrendingUp,
  Receipt,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    families,
    payments,
    settings,
    financialStatuses,
    currentUser,
    isInitialized,
  } = useApp();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const isAdminOrSub = currentUser.role === 'main_admin' || currentUser.role === 'sub_admin';

  if (!isInitialized) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  // Aggregate Metrics
  const totalCollected = financialStatuses.reduce((acc, s) => acc + s.total_paid, 0);
  const targetAmount = settings.target_amount || 306000;
  const progressPercent = targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
  const daysToEid = getDaysUntilEid(settings.eid_date);
  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);

  // Behind families for alert
  const behindFamilies = financialStatuses.filter((s) => s.status === 'due');

  // Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5);

  // Copy single account number
  const handleCopyAccount = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(accNum);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Copy full WhatsApp text with status + bank accounts
  const handleCopyWhatsapp = () => {
    const text = `🌙 *Qurban Family Savings 2026/27*
📅 *Week ${currentWeek} of ${settings.total_weeks} Update*
━━━━━━━━━━━━━━━━━━━━

${financialStatuses
  .map(
    (s) =>
      `*${s.family_name}*: ${formatCurrency(s.total_paid)} paid · ${
        s.status === 'ok'
          ? '✅ Up to date'
          : s.status === 'advance'
          ? `🌟 +${s.weeks_ahead}w ahead`
          : `⚠️ ${formatCurrency(Math.abs(s.balance))} due (${s.weeks_behind}w behind)`
      }`
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━
💰 *Total Fund Collected:* ${formatCurrency(totalCollected)} / Rs. ${targetAmount.toLocaleString()} (${progressPercent.toFixed(1)}%)
🎯 *Target:* Rs. 306,000 (51 weeks × Rs. 6,000)
🌙 *Days to Eid:* ${daysToEid} Days (16 May 2027)

🏦 *Bank Accounts for Contributions:*

1️⃣ *Commercial Bank*
A/C: 8016292617
Name: M N Hamas
Branch: 101 - Nawala Branch

2️⃣ *Amana Bank*
A/C: 0110578227001
Name: MN Hamas
Branch: Kurunegala

3️⃣ *BOC (An-Noor)*
A/C: 96503121
Name: MN Hamas
Branch: Galgamuwa

_Please send payment confirmation slip to Mr. Hamas on WhatsApp._

Jazakallahu Khairan 🤲 · #QurbanFamily2027`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. HERO HEADER BANNER ================= */}
      <div className="rounded-3xl bg-[#062c21] bg-linear-to-br from-[#062c21] via-[#043c2f] to-[#091522] !text-white p-5 sm:p-7 shadow-xl border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <span>🌙</span>
              <span>Week {currentWeek} of {settings.total_weeks}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
              4 Families · Rs. 1,500/wk
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight !text-white pt-1">
            {settings.fund_name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
            Joint Qurban Savings for Eid al-Adha · ~16 May 2027
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {isAdminOrSub ? (
            <Link
              href="/payments/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Add Payment</span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold transition-all active:scale-95 shadow-xs"
              title="Sign in as Mr. Hamas or Nihla"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Admin Sign In</span>
            </button>
          )}

          <button
            onClick={handleCopyWhatsapp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/60 text-xs font-bold transition-all active:scale-95 shadow-xs"
            title="Copy formatted WhatsApp summary"
          >
            {copiedWhatsapp ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>WhatsApp Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* ================= 2. OUTSTANDING ALERT (Subtle Alert, NOT Full Red) ================= */}
      {behindFamilies.length > 0 && (
        <div className="bg-white dark:bg-[#111622] rounded-2xl p-4 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div className="text-slate-800 dark:text-slate-200">
              <strong className="font-bold text-rose-700 dark:text-rose-400">Payment Due Notice: </strong>
              {behindFamilies.map((f, i) => (
                <span key={f.family_id}>
                  {i > 0 && ', '}
                  <strong className="text-slate-900 dark:text-white">{f.family_name}</strong> (
                  <span className="font-bold text-rose-700 dark:text-rose-400">
                    {formatCurrency(Math.abs(f.balance))}
                  </span>{' '}
                  · {f.weeks_behind}w behind)
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/tracker"
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1"
          >
            <span>View 51-Week Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ================= 3. KPI METRIC STRIP ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Fund Collected */}
        <div className="bg-white dark:bg-[#111622] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Fund Collected
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex justify-between">
            <span>Target: {formatCurrency(targetAmount)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">51 Weeks</span>
          </div>
        </div>

        {/* Weekly Contribution Status */}
        <div className="bg-white dark:bg-[#111622] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contribution Rate
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Rs. 6k / week
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Rs. 1,500
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Per family per week · 4 families total
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
            Week {currentWeek} currently due
          </div>
        </div>

        {/* Days to Eid al-Adha */}
        <div className="bg-white dark:bg-[#111622] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Festival
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Eid 2027
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {daysToEid} Days
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Approx. Sunday, 16 May 2027
          </div>
          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
            {settings.total_weeks - currentWeek} weeks remaining
          </div>
        </div>
      </div>

      {/* ================= 4. THE SUMMARY TABLE (HERO TABLE REQUESTED BY USER) ================= */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Family Contribution Summary
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Live status across all 4 families for Week {currentWeek} (Expected: {formatCurrency(currentWeek * 1500)} each)
            </p>
          </div>

          <Link
            href="/tracker"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Full 51-Week Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Family</th>
                <th className="py-3.5 px-4">Total Paid</th>
                <th className="py-3.5 px-4">Expected (W1–{currentWeek})</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Last Payment</th>
                {isAdminOrSub && <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {financialStatuses.map((s) => {
                const isDue = s.status === 'due';
                const isAdvance = s.status === 'advance';

                return (
                  <tr
                    key={s.family_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Family Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {s.family_name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.family_id === 'fam-hamas' ? 'Mr. Hamas (Admin)' : 'Rs. 1,500 / week'}
                      </div>
                    </td>

                    {/* Total Paid */}
                    <td className="py-4 px-4">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(s.total_paid)}
                      </div>
                      <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        {(s.total_paid / 1500).toFixed(0)} of 51 wks paid
                      </div>
                    </td>

                    {/* Expected */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                      {formatCurrency(s.expected_amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {isDue ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{formatCurrency(Math.abs(s.balance))} due · {s.weeks_behind}w behind</span>
                        </span>
                      ) : isAdvance ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>+{formatCurrency(s.balance)} · {s.weeks_ahead}w ahead</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Up to date (Paid W{currentWeek})</span>
                        </span>
                      )}
                    </td>

                    {/* Last Payment */}
                    <td className="py-4 px-4">
                      {s.last_payment_date ? (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDisplayDate(s.last_payment_date)}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                            +{formatCurrency(s.last_payment_amount || 0)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Action Button for Admin */}
                    {isAdminOrSub && (
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/payments/add?family=${s.family_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                          <span>+ Pay</span>
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer */}
            <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700 font-bold">
              <tr>
                <td className="py-4 px-4 sm:px-6 text-slate-800 dark:text-slate-200 font-bold uppercase text-[11px]">
                  Total Fund (4 Families)
                </td>
                <td className="py-4 px-4 font-black text-emerald-700 dark:text-emerald-400 text-base">
                  {formatCurrency(totalCollected)}
                </td>
                <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(currentWeek * 6000)}
                </td>
                <td
                  className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  colSpan={isAdminOrSub ? 3 : 2}
                >
                  Target: {formatCurrency(targetAmount)} ({progressPercent.toFixed(1)}% achieved)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ================= 5. BANK ACCOUNTS SECTION (BELOW THE TABLE) ================= */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200 dark:border-emerald-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Bank Accounts for Contributions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Transfer Rs. 1,500/week to any account below & share transfer slip on WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyWhatsapp}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copy All Bank Info</span>
          </button>
        </div>

        {/* 3 Bank Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {HAMAS_BANK_ACCOUNTS.map((acc, idx) => {
            const isCopied = copiedAccount === acc.account_number;

            return (
              <div
                key={acc.account_number}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 hover:border-emerald-500 transition-colors shadow-2xs"
              >
                {/* Bank Name Header */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {acc.bank_name}
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Option #{idx + 1}
                  </span>
                </div>

                {/* Account Number Box with Big Copy Button */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Account Number
                    </div>
                    <div className="font-mono font-black text-base text-slate-900 dark:text-white tracking-wide truncate">
                      {acc.account_number}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyAccount(acc.account_number)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-emerald-950 dark:text-slate-300 dark:hover:text-emerald-300'
                    }`}
                    title="Copy Account Number"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Holder & Branch */}
                <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Account Name:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{acc.account_name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Branch:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{acc.branch}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
          <span>📲 <strong>Reminder:</strong> Please send payment confirmation slip to Mr. Hamas on WhatsApp after transferring.</span>
          <button
            onClick={handleCopyWhatsapp}
            className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 underline shrink-0 hover:text-emerald-950"
          >
            Copy WhatsApp Template
          </button>
        </div>
      </div>

      {/* ================= 6. RECENT PAYMENTS LIST (MINIMAL AUDIT TRAIL) ================= */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Contributions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last {recentPayments.length} transactions recorded with audit log
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {payments.length} payments recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Family</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Reference / Note</th>
                <th className="py-2.5 px-3 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentPayments.map((p) => {
                const family = families.find((f) => f.id === p.family_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatDisplayDate(p.payment_date)}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {family?.name || p.family_id}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {p.note || p.reference_number || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-right text-[11px]">
                      {p.entered_by}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
