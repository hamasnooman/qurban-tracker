'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { FamilyFinancialStatus } from '@/types';
import { formatCurrency, formatDisplayDate } from '@/lib/calculations';
import { CheckCircle2, AlertTriangle, ArrowUpRight, ChevronRight } from 'lucide-react';

interface FamilyCardProps {
  status: FamilyFinancialStatus;
}

export function FamilyCard({ status }: FamilyCardProps) {
  const { currentUser } = useApp();
  const isDue = status.status === 'due';
  const isAdvance = status.status === 'advance';
  const canAdd = currentUser.role === 'main_admin' || currentUser.role === 'sub_admin';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header: Family Name & Clean Status Indicator */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-base text-stone-900 dark:text-white tracking-tight">
            {status.family_name}
          </h3>

          {/* Simple alert mark only for outstanding, clean pills for advance/ok */}
          {isDue ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{status.weeks_behind}w behind</span>
            </span>
          ) : isAdvance ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{status.weeks_ahead}w ahead</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Up to date</span>
            </span>
          )}
        </div>

        {/* Clean 2-column metrics */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
          <div>
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Total Paid</div>
            <div className="text-base font-extrabold text-stone-900 dark:text-white">
              {formatCurrency(status.total_paid)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Balance</div>
            <div
              className={`text-base font-extrabold ${
                isDue
                  ? 'text-rose-600 dark:text-rose-400'
                  : isAdvance
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {status.balance === 0
                ? 'Rs. 0'
                : status.balance > 0
                ? `+${formatCurrency(status.balance)}`
                : formatCurrency(status.balance)}
            </div>
          </div>
        </div>

        {/* Short Status Note */}
        <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
          <span>{status.status_label}</span>
          {status.last_payment_date && (
            <span className="font-mono text-[11px] text-stone-400">
              {formatDisplayDate(status.last_payment_date)}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
        <Link
          href={`/family/${status.family_id}`}
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-0.5"
        >
          <span>Statement</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        {canAdd && (
          <Link
            href={`/payments/add?family=${status.family_id}`}
            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            + Add Pay
          </Link>
        )}
      </div>
    </div>
  );
}
