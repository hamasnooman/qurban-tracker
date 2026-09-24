'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { HAMAS_BANK_ACCOUNTS } from '@/lib/mock-data';
import {
  formatCurrency,
  formatDisplayDate,
  getColomboDate,
  calculateWeeklyGrid,
  getWeeksDue,
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
  Lock,
  KeyRound,
  Download,
} from 'lucide-react';

export default function ReportPage() {
  const { families, payments, settings, financialStatuses, currentUser } = useApp();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'due' | 'all'>('due');

  const isMainAdmin = currentUser.role === 'main_admin';

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const targetAmount = settings.target_amount || 306000;
  const progressPercent = Math.min(100, (totalCollected / targetAmount) * 100);
  const totalRemaining = Math.max(0, targetAmount - totalCollected);
  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);

  // Generate 51-week calculation grid
  const gridData = calculateWeeklyGrid(families, payments, settings);
  const displayedRows =
    viewMode === 'due'
      ? gridData.rows.filter((r) => r.week_number <= currentWeek)
      : gridData.rows;

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

  // ================= MAIN ADMIN SECURITY GATE =================
  if (!isMainAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Main Admin Exclusive
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Main Admin Access Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The Complete PDF Final Summary Report contains confidential multi-family financial allocations and is restricted exclusively to <strong>Mr. Hamas</strong> (Main Admin).
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ← Return to Summary
          </Link>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Sign In as Mr. Hamas</span>
          </button>
        </div>
        <AdminLoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </div>
    );
  }

  // ================= MAIN ADMIN REPORT CONTENT =================
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Bar (Screen Only - Hidden when printing or saving as PDF) */}
      <div className="no-print bg-white dark:bg-[#111622] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Return to Summary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>PDF Final Summary Report</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authenticated as Mr. Hamas (Main Admin) · Ready for PDF download / print
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* View toggle for report rows */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('due')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'due'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weeks 1–{currentWeek} (Active)
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All 51 Weeks
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Download / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* ================= THE PRINTABLE DOCUMENT ================= */}
      <div className="print-card bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-slate-900 dark:text-slate-100">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-700 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center text-3xl shadow-sm shrink-0">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 dark:text-emerald-400">
                  Official Financial Statement
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Main Admin Copy
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {settings.fund_name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                4-Family Joint Savings Fund for Eid al-Adha 1448 AH · Target Date: ~16 May 2027
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              Report Generated:
            </div>
            <div className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
              {reportDateStr}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator: Mr. M N Hamas</span>
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
              Current Week
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Week {currentWeek} of {settings.total_weeks || 51}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Rs. 1,500 / family / wk</div>
          </div>
        </div>

        {/* ================= 2. FOUR CLEAR FAMILY COLUMNS / CARDS ================= */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>1. Family Contribution Summary</span>
              <span className="text-xs font-normal text-slate-500 normal-case">(Individual Breakdown)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Target: Rs. 76,500 each</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {financialStatuses.map((s) => {
              const isDue = s.status === 'due';
              const isAdvance = s.status === 'advance';
              const familyTarget = 51 * 1500;
              const familyProgress = Math.min(100, (s.total_paid / familyTarget) * 100);

              return (
                <div
                  key={s.family_id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  {/* Family Header */}
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {s.family_name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {s.family_id === 'fam-hamas' ? 'Mr. Hamas (Admin)' : 'Contributing Family'}
                    </div>
                  </div>

                  {/* Total Paid in Big Numbers */}
                  <div>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(s.total_paid)}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {(s.total_paid / 1500).toFixed(0)} of 51 weeks paid ({familyProgress.toFixed(0)}%)
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${familyProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Status Badge */}
                  <div>
                    {isDue ? (
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] font-extrabold text-rose-800 dark:text-rose-300">
                        ⚠ Due: {formatCurrency(Math.abs(s.balance))} ({s.weeks_behind}w behind)
                      </div>
                    ) : isAdvance ? (
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                        ★ +{formatCurrency(s.balance)} in advance ({s.weeks_ahead}w ahead)
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">
                        ✓ Up to date (Paid W{currentWeek})
                      </div>
                    )}
                  </div>

                  {/* Last Contribution */}
                  <div className="pt-1 text-[11px] border-t border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400 text-[10px]">Last Payment: </span>
                    {s.last_payment_date ? (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDisplayDate(s.last_payment_date)} (+{formatCurrency(s.last_payment_amount || 0)})
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 3. WEEKLY SAVINGS GRID WITH CLEAR COLUMNS FOR EACH FAMILY ================= */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>2. Weekly Savings Grid Matrix</span>
              <span className="text-xs font-normal text-slate-500 normal-case">
                ({displayedRows.length} Weeks Shown)
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Rs. 1,500/family/week</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px] border-b-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-16 text-center border-r border-slate-200 dark:border-slate-700">
                    Week #
                  </th>
                  <th className="py-3 px-4 w-28 border-r border-slate-200 dark:border-slate-700">
                    Week Date
                  </th>
                  {families.map((fam) => (
                    <th
                      key={fam.id}
                      className="py-3 px-4 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <div className="font-black text-slate-900 dark:text-white">{fam.name}</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        Rs. 1,500/wk
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right w-32">
                    <div className="font-black text-slate-900 dark:text-white">Week Total</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                      Target: Rs. 6,000
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedRows.map((row) => {
                  const isCurrent = row.week_number === currentWeek;
                  const isMet = row.row_total >= row.row_target;

                  return (
                    <tr
                      key={row.week_number}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        isCurrent ? 'bg-amber-50/70 dark:bg-amber-950/30 font-semibold' : ''
                      }`}
                    >
                      {/* Week # */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200 dark:border-slate-800">
                        <span>W{row.week_number}</span>
                        {isCurrent && (
                          <span className="ml-1 px-1 py-0.2 rounded text-[9px] bg-amber-500 text-slate-950 font-black">
                            NOW
                          </span>
                        )}
                      </td>

                      {/* Week Date */}
                      <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {row.formatted_date}
                      </td>

                      {/* Clear Family Columns */}
                      {families.map((fam) => {
                        const cell = row.family_cells[fam.id];
                        const isPaid = cell?.status === 'paid';
                        const isAdvance = cell?.status === 'advance';
                        const isPart = cell?.status === 'part';

                        return (
                          <td
                            key={fam.id}
                            className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                          >
                            {isPaid ? (
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                                Paid (Rs. 1,500)
                              </span>
                            ) : isAdvance ? (
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800">
                                Paid in advance
                              </span>
                            ) : isPart ? (
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                                Part (Rs. {cell.allocated_amount})
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
                                Not paid
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Week Total */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        <span
                          className={
                            isMet
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : row.row_total > 0
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-400'
                          }
                        >
                          {formatCurrency(row.row_total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Grand Total Row */}
              <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-amber-400 shadow-md">
                <tr>
                  <td className="py-3 px-3 uppercase text-[10px] tracking-wider text-center" colSpan={2}>
                    Grand Total (51 Wks)
                  </td>
                  {families.map((fam) => {
                    const paid = gridData.familyTotals[fam.id] || 0;
                    return (
                      <td key={fam.id} className="py-3 px-3 text-center border-r border-slate-800">
                        <div className="text-xs font-black text-amber-300 font-mono">
                          {formatCurrency(paid)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-normal">
                          of Rs. {(51 * 1500).toLocaleString()} target
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm font-black text-amber-300 font-mono">
                      {formatCurrency(gridData.grandTotal)}
                    </div>
                    <div className="text-[9px] text-slate-400 font-normal">
                      Target: {formatCurrency(gridData.totalTarget)}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Designated Bank Accounts */}
        <div className="space-y-2.5 print-avoid-break">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            3. Designated Bank Accounts for Fund Transfer
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

        {/* 5. Complete Audit Trail / Payments Record */}
        <div className="space-y-2.5 print-avoid-break">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            4. Complete Transactions Audit Ledger ({payments.length} Payments Recorded)
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

        {/* 6. Document Sign-Off & Verification Footer */}
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
