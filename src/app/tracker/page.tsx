'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { calculateWeeklyGrid, formatCurrency, getWeeksDue } from '@/lib/calculations';
import {
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDown,
  Sparkles,
  Download,
} from 'lucide-react';

export default function WeeklyTrackerPage() {
  const { families, payments, settings } = useApp();
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'active'>('active');

  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);

  // Calculate the grid using our single shared calculation function!
  const gridData = useMemo(() => {
    return calculateWeeklyGrid(families, payments, settings);
  }, [families, payments, settings]);

  // Filter rows based on view toggle
  const visibleRows = useMemo(() => {
    if (filterMode === 'all') return gridData.rows;
    if (filterMode === 'active') {
      // Show up to currentWeek + 3 weeks
      return gridData.rows.filter((r) => r.week_number <= Math.max(12, currentWeek + 2));
    }
    if (filterMode === 'due') {
      // Only past and current weeks
      return gridData.rows.filter((r) => r.week_number <= currentWeek);
    }
    return gridData.rows;
  }, [gridData.rows, filterMode, currentWeek]);

  const getCellBadge = (cell: { status: string; allocated_amount: number; label: string }) => {
    switch (cell.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Paid (Rs. 1,500)
          </span>
        );
      case 'part':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            {cell.label}
          </span>
        );
      case 'advance':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            {cell.label}
          </span>
        );
      case 'unpaid':
      default:
        return cell.label === '—' ? (
          <span className="text-stone-400 dark:text-stone-600 font-mono">—</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            Not paid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline mb-1"
          >
            ← Back to Summary & Accounts
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            <span>Weekly Savings Grid (51 Weeks)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automated waterfall allocation: money fills oldest unpaid weeks first
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto font-medium">
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'active'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active Horizon
          </button>
          <button
            onClick={() => setFilterMode('due')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'due'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Due Weeks Only (1–{currentWeek})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All 51 Weeks
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Paid (Full Rs. 1,500)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Part-paid</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Not paid</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Paid in advance</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
          ★ Current Week: Week {currentWeek}
        </div>
      </div>

      {/* The 51-Week Grid Table */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/95 backdrop-blur-xs shadow-xs">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px]">
                <th className="py-3.5 px-4 w-20">Week #</th>
                <th className="py-3.5 px-4 w-32">Week Date</th>
                {families.map((fam) => (
                  <th key={fam.id} className="py-3.5 px-4 text-center">
                    <div className="font-extrabold text-slate-900 dark:text-white">{fam.name}</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Rs. 1,500/wk</div>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right w-36">
                  <div className="font-extrabold text-slate-900 dark:text-white">Week Total</div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Target: Rs. 6,000</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {visibleRows.map((row) => {
                const isCurrent = row.week_number === currentWeek;
                const isMet = row.row_total >= row.row_target;

                return (
                  <tr
                    key={row.week_number}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Week Number */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          W{row.week_number}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                            NOW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Week Date */}
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.formatted_date}
                    </td>

                    {/* 4 Families Cells */}
                    {families.map((fam) => {
                      const cell = row.family_cells[fam.id];
                      return (
                        <td key={fam.id} className="py-3 px-4 text-center whitespace-nowrap">
                          {getCellBadge(cell)}
                        </td>
                      );
                    })}

                    {/* Week Total */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            isMet
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : row.row_total > 0
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(row.row_total)}
                        </span>
                        {isMet && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Sticky Grand Totals Row */}
            <tfoot className="sticky bottom-0 z-20 bg-slate-950 text-white font-bold border-t-2 border-amber-400 shadow-xl">
              <tr>
                <td className="py-4 px-4 uppercase text-xs tracking-wider" colSpan={2}>
                  Grand Total (51 Weeks)
                </td>
                {families.map((fam) => {
                  const paid = gridData.familyTotals[fam.id] || 0;
                  return (
                    <td key={fam.id} className="py-4 px-4 text-center">
                      <div className="text-sm font-black text-amber-300">
                        {formatCurrency(paid)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        of Rs. {(51 * 1500).toLocaleString()} target
                      </div>
                    </td>
                  );
                })}
                <td className="py-4 px-4 text-right">
                  <div className="text-base font-black text-amber-300">
                    {formatCurrency(gridData.grandTotal)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Target: {formatCurrency(gridData.totalTarget)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
