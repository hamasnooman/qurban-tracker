'use client';

import React from 'react';
import { Payment, AppSettings } from '@/types';
import { formatCurrency, getWeeksDue } from '@/lib/calculations';

interface ChartsProps {
  payments: Payment[];
  settings: AppSettings;
}

export function Charts({ payments, settings }: ChartsProps) {
  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);

  // 1. Calculate Weekly Collections for weeks 1 through Math.max(10, currentWeek)
  const maxWeekToShow = Math.min(settings.total_weeks, Math.max(10, currentWeek));
  const weekData: Array<{ week: number; total: number; target: number }> = [];

  for (let w = 1; w <= maxWeekToShow; w++) {
    // Collect payments made in this week period or reference tags
    // For existing seed data, ref includes W{w} or matching week dates
    const weekPayments = payments.filter((p) => {
      if (p.reference_number?.includes(`W${w}-`)) return true;
      // Also match date proximity (7-day window)
      const startDate = new Date(settings.start_date + 'T00:00:00');
      const wStart = new Date(startDate);
      wStart.setDate(wStart.getDate() + (w - 1) * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);

      const pDate = new Date(p.payment_date + 'T00:00:00');
      return pDate >= wStart && pDate <= wEnd;
    });

    const total = weekPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    weekData.push({
      week: w,
      total,
      target: 6000,
    });
  }

  // 2. Calculate Payment Method Breakdown
  const methodMap: Record<string, number> = {
    Cash: 0,
    BOC: 0,
    'Commercial Bank': 0,
    'Amana Bank': 0,
    Other: 0,
  };

  payments.forEach((p) => {
    const method = p.payment_method || 'Other';
    methodMap[method] = (methodMap[method] || 0) + (Number(p.amount) || 0);
  });

  const totalCollectedAll = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const methodColors: Record<string, string> = {
    Cash: 'bg-emerald-600',
    BOC: 'bg-amber-500',
    'Commercial Bank': 'bg-blue-600',
    'Amana Bank': 'bg-teal-600',
    Other: 'bg-stone-500',
  };

  const maxWeeklyAmount = Math.max(7000, ...weekData.map((d) => d.total));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Weekly Collection Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">
              Weekly Collections
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Weekly target: Rs. 6,000 (4 families × Rs. 1,500)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              Target Met (Rs. 6,000)
            </span>
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="w-3 h-3 rounded bg-amber-500" />
              Partial
            </span>
          </div>
        </div>

        {/* SVG/CSS Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-48 flex items-end justify-between gap-1.5 md:gap-3 border-b border-stone-200 dark:border-stone-800 relative">
            {/* Target line at 6,000 */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-emerald-400/80 z-10 pointer-events-none flex items-center justify-end"
              style={{
                bottom: `${(6000 / maxWeeklyAmount) * 100}%`,
              }}
            >
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">
                Rs. 6k Target
              </span>
            </div>

            {weekData.map((d) => {
              const heightPercent = (d.total / maxWeeklyAmount) * 100;
              const isMet = d.total >= d.target;
              const isZero = d.total === 0;

              return (
                <div
                  key={d.week}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-stone-900 text-white text-[11px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    Week {d.week}: {formatCurrency(d.total)}
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isZero
                        ? 'h-1 bg-stone-200 dark:bg-stone-800'
                        : isMet
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 group-hover:brightness-110'
                        : 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-110'
                    }`}
                    style={{ height: isZero ? '4px' : `${Math.max(6, heightPercent)}%` }}
                  />

                  {/* Label */}
                  <span className="text-[10px] md:text-xs font-mono font-medium text-stone-500 mt-2">
                    W{d.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart 2: Payment Method Breakdown */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-stone-900 dark:text-white text-base">
            Payment Methods
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Breakdown across Rs. {totalCollectedAll.toLocaleString()} collected
          </p>

          {/* Stacked Progress Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-stone-100 dark:bg-stone-800 mb-5">
            {Object.entries(methodMap).map(([method, amount]) => {
              if (amount === 0) return null;
              const percent = (amount / totalCollectedAll) * 100;
              return (
                <div
                  key={method}
                  className={`${methodColors[method]} h-full transition-all`}
                  style={{ width: `${percent}%` }}
                  title={`${method}: ${formatCurrency(amount)} (${percent.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legends */}
          <div className="space-y-2.5">
            {Object.entries(methodMap).map(([method, amount]) => {
              const percent = totalCollectedAll > 0 ? (amount / totalCollectedAll) * 100 : 0;
              return (
                <div key={method} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${methodColors[method]}`} />
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {method}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 dark:text-white">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-[11px] text-stone-400 ml-1.5">
                      ({percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 text-center">
          Cash & Bank deposits recorded with date stamps
        </div>
      </div>
    </div>
  );
}
