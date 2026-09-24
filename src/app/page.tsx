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
        <div className="h-24 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
        <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
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

🏦 *Bank Account Details for Payments:*

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

Jazakallahu Khairan 🤲 · #QurbanFamily2027`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-5 sm:p-6 shadow-md border border-emerald-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300">
            <span>🌙 Week {currentWeek} of {settings.total_weeks}</span>
            <span>·</span>
            <span>4 Families</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-700/60 text-emerald-200 border border-emerald-600/50">
              {isAdminOrSub ? currentUser.name : 'Complete Review Summary'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
            {settings.fund_name}
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Rs. 1,500/week per family · Joint Qurban ~16 May 2027
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isAdminOrSub ? (
            <Link
              href="/payments/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Payment</span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold transition-all active:scale-95"
              title="Sign In as Mr. Hamas or Nihla to enter payments"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Admin Sign In</span>
            </button>
          )}

          <button
            onClick={handleCopyWhatsapp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all active:scale-95"
            title="Copy formatted WhatsApp summary"
          >
            {copiedWhatsapp ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
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

      {/* 2. Outstanding Alert (Subtle warning icon, NOT heavy red) */}
      {behindFamilies.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <span className="text-stone-700 dark:text-stone-300">
              <strong className="font-semibold text-rose-600 dark:text-rose-400">Payment Due: </strong>
              {behindFamilies.map((f, i) => (
                <span key={f.family_id}>
                  {i > 0 && ', '}
                  <strong className="text-stone-900 dark:text-white">{f.family_name}</strong> ({formatCurrency(Math.abs(f.balance))} · {f.weeks_behind}w behind)
                </span>
              ))}
            </span>
          </div>

          <Link
            href="/tracker"
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1"
          >
            <span>51-Week Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Compact 3-Metric Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
            Total Fund
          </div>
          <div className="text-base sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
            {progressPercent.toFixed(1)}% of {formatCurrency(targetAmount)}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
            Weekly Rate
          </div>
          <div className="text-base sm:text-2xl font-black text-stone-900 dark:text-white mt-0.5 truncate">
            Rs. 1,500
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
            Week {currentWeek} of {settings.total_weeks}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
            Days to Eid
          </div>
          <div className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
            {daysToEid} Days
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
            16 May 2027
          </div>
        </div>
      </div>

      {/* 4. THE SUMMARY TABLE (The Core Section Requested by User) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
              Family Contribution Summary
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Week {currentWeek} review for all 4 participating families
            </p>
          </div>
          <Link
            href="/tracker"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>51-Week Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Expected (W1–{currentWeek})</th>
                <th className="py-3 px-4">Status / Balance</th>
                <th className="py-3 px-4">Last Payment</th>
                {isAdminOrSub && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {financialStatuses.map((s) => {
                const isDue = s.status === 'due';
                const isAdvance = s.status === 'advance';

                return (
                  <tr
                    key={s.family_id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    {/* Family Name */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{s.family_name}</span>
                        {s.family_id === 'fam-hamas' && (
                          <span className="text-[10px] font-normal text-stone-400">(Admin)</span>
                        )}
                      </div>
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 font-extrabold text-stone-900 dark:text-white text-sm">
                      {formatCurrency(s.total_paid)}
                    </td>

                    {/* Expected */}
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 font-medium">
                      {formatCurrency(s.expected_amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {isDue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{formatCurrency(Math.abs(s.balance))} due ({s.weeks_behind}w behind)</span>
                        </span>
                      ) : isAdvance ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                          <span>🌟 +{formatCurrency(s.balance)} ({s.weeks_ahead}w ahead)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Up to date</span>
                        </span>
                      )}
                    </td>

                    {/* Last Payment */}
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                      {s.last_payment_date ? (
                        <span>
                          {formatDisplayDate(s.last_payment_date)} ({formatCurrency(s.last_payment_amount || 0)})
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Admin Action */}
                    {isAdminOrSub && (
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/payments/add?family=${s.family_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Pay</span>
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer Total */}
            <tfoot className="bg-stone-50 dark:bg-stone-800/80 border-t-2 border-stone-200 dark:border-stone-700 font-bold">
              <tr>
                <td className="py-3 px-4 uppercase text-[11px] text-stone-500">
                  Total (All 4 Families)
                </td>
                <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {formatCurrency(totalCollected)}
                </td>
                <td className="py-3 px-4 text-stone-500 text-xs">
                  {formatCurrency(currentWeek * 6000)} (W1–{currentWeek})
                </td>
                <td className="py-3 px-4 text-stone-500 text-xs" colSpan={isAdminOrSub ? 3 : 2}>
                  Target: {formatCurrency(targetAmount)} ({progressPercent.toFixed(1)}%)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. BANK ACCOUNTS SECTION (Below the Table as Requested) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">
                Bank Account Details for Payments
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Transfer Rs. 1,500/week to any account below & WhatsApp receipt to Mr. Hamas
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyWhatsapp}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copy All Details</span>
          </button>
        </div>

        {/* The 3 Bank Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HAMAS_BANK_ACCOUNTS.map((acc, idx) => {
            const isCopied = copiedAccount === acc.account_number;

            return (
              <div
                key={acc.account_number}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2.5 hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400">
                    {acc.bank_name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                    #{idx + 1}
                  </span>
                </div>

                {/* Account Number Box with 1-click Copy */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Account #</div>
                    <div className="font-mono font-black text-sm text-stone-900 dark:text-white truncate">
                      {acc.account_number}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyAccount(acc.account_number)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 dark:bg-stone-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors shrink-0"
                    title="Copy Account Number"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Account Details */}
                <div className="text-[11px] space-y-0.5 text-stone-600 dark:text-stone-300">
                  <div>
                    <span className="text-stone-400">Name: </span>
                    <strong className="text-stone-800 dark:text-stone-200">{acc.account_name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Branch: </span>
                    <span>{acc.branch}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Payments List (Minimal 5 rows) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">
            Recent Payments Recorded
          </h2>
          <span className="text-xs text-stone-400 font-medium">
            Total {payments.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase font-semibold text-[11px]">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Family</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Method</th>
                <th className="py-2 px-3">Note / Reference</th>
                <th className="py-2 px-3 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {recentPayments.map((p) => {
                const family = families.find((f) => f.id === p.family_id);
                return (
                  <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-3 font-mono text-stone-600 dark:text-stone-300">
                      {formatDisplayDate(p.payment_date)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-white">
                      {family?.name || p.family_id}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">
                      {p.payment_method}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 max-w-xs truncate">
                      {p.note || p.reference_number || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-stone-400 text-right text-[11px]">
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
