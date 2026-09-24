'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { HAMAS_BANK_ACCOUNTS } from '@/lib/mock-data';
import {
  formatCurrency,
  formatDisplayDate,
  getColomboDate,
} from '@/lib/calculations';
import {
  Printer,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function ReportPage() {
  const { families, payments, settings, financialStatuses } = useApp();

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const targetAmount = settings.target_amount || 306000;
  const progressPercent = Math.min(100, (totalCollected / targetAmount) * 100);
  const totalRemaining = Math.max(0, targetAmount - totalCollected);

  const reportDateStr = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Colombo',
  }).format(getColomboDate());

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ================= ON-SCREEN ACTION BAR (HIDDEN IN PRINT) ================= */}
      <div className="no-print bg-white dark:bg-[#111622] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Return to Summary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Complete PDF Final Summary</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official printable audit report for all 4 families
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* ================= THE PRINTABLE DOCUMENT ================= */}
      <div className="print-card bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-slate-900 dark:text-slate-100">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-700 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center text-3xl shadow-sm">
              🌙
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                Official Fund Statement
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {settings.fund_name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Joint Savings Fund for Eid al-Adha 1448 AH · Target Date: ~16 May 2027
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              Report Generated:
            </div>
            <div className="font-mono text-slate-600 dark:text-slate-400">
              {reportDateStr}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin: Mr. M N Hamas</span>
            </div>
          </div>
        </div>

        {/* 1. Fund KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Total Fund Target
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(targetAmount)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">51 weeks · 4 families</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
              Total Collected
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {formatCurrency(totalCollected)}
            </div>
            <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
              {progressPercent.toFixed(1)}% Achieved
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Total Remaining
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">To target completion</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Current Horizon
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Week {settings.total_weeks ? `${financialStatuses[0]?.weeks_behind !== undefined ? 'Active' : ''}` : '51'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Rs. 1,500 / family / wk</div>
          </div>
        </div>

        {/* 2. Family Breakdown Table */}
        <div className="space-y-2.5 print-avoid-break">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Family Contribution Summary
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Family Name</th>
                  <th className="py-3 px-4">Target (51 Wks)</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Weeks Paid</th>
                  <th className="py-3 px-4 text-right">Last Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {financialStatuses.map((s) => {
                  const isDue = s.status === 'due';
                  const isAdvance = s.status === 'advance';

                  return (
                    <tr key={s.family_id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{s.family_name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {s.family_id === 'fam-hamas' ? 'Administrator' : 'Contributing Family'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(51 * 1500)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(s.total_paid)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDue ? (
                          <span className="font-bold text-rose-700 dark:text-rose-400">
                            Due: {formatCurrency(Math.abs(s.balance))} ({s.weeks_behind}w behind)
                          </span>
                        ) : isAdvance ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            +{formatCurrency(s.balance)} in advance ({s.weeks_ahead}w ahead)
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ Up to date
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {(s.total_paid / 1500).toFixed(0)} of 51 weeks
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.last_payment_date ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {formatDisplayDate(s.last_payment_date)}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                              +{formatCurrency(s.last_payment_amount || 0)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600 font-bold">
                <tr>
                  <td className="py-3 px-4 uppercase text-[11px]">Total Fund</td>
                  <td className="py-3 px-4 font-mono">{formatCurrency(targetAmount)}</td>
                  <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(totalCollected)}
                  </td>
                  <td className="py-3 px-4" colSpan={3}>
                    Progress: {progressPercent.toFixed(1)}% achieved · {formatCurrency(totalRemaining)} remaining
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 3. Official Bank Accounts */}
        <div className="space-y-2.5 print-avoid-break">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. Designated Bank Accounts for Fund Transfer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {HAMAS_BANK_ACCOUNTS.map((acc, idx) => (
              <div
                key={acc.account_number}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{acc.bank_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                </div>
                <div className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {acc.account_number}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Account Name: <strong>{acc.account_name}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Branch: {acc.branch}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Complete Audit Trail / Payments Record */}
        <div className="space-y-2.5 print-avoid-break">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            3. Complete Transactions Audit Ledger ({payments.length} Payments Recorded)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Family</th>
                  <th className="py-2.5 px-3">Payer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Reference / Notes</th>
                  <th className="py-2.5 px-3 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.payment_date).getTime() -
                      new Date(a.payment_date).getTime()
                  )
                  .map((p) => {
                    const family = families.find((f) => f.id === p.family_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-600 dark:text-slate-400">
                          {formatDisplayDate(p.payment_date)}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {family?.name || p.family_id}
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                          {p.paid_by}
                        </td>
                        <td className="py-2 px-3 font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                          {p.payment_method}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                          {p.note || p.reference_number || '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-[11px] font-mono text-slate-500">
                          {p.entered_by}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Document Sign-Off & Verification Footer */}
        <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 print-avoid-break">
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Fund Administrator Verification
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">
                Mr. M N Hamas (Main Administrator)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This document certifies that all payments recorded above have been reconciled with bank deposit statements and cash receipts.
              </p>
              <div className="pt-2 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Certified Accurate as of {reportDateStr}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-right sm:text-right flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Islamic Dua & Intention
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs italic mt-1">
                &ldquo;May Allah (SWT) accept this noble effort, bless our families with barakah, unity, and ease, and accept our Qurban sacrifices. Ameen.&rdquo;
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 pt-3">
              Jazakallahu Khairan 🤲 · #QurbanFamily2027
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
