'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  badge?: {
    text: string;
    variant: 'green' | 'amber' | 'red' | 'blue';
  };
  progress?: {
    current: number;
    total: number;
    percent: number;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  progress,
}: StatCardProps) {
  const getBadgeStyle = (variant: 'green' | 'amber' | 'red' | 'blue') => {
    switch (variant) {
      case 'green':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'red':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
            {title}
          </p>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight truncate">
            {value}
          </div>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 flex items-center justify-center text-base sm:text-xl shrink-0 border border-amber-100/80 dark:border-stone-700">
          {icon}
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs gap-2">
          {subtitle && (
            <span className="text-stone-500 dark:text-stone-400 font-medium">
              {subtitle}
            </span>
          )}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
                badge.variant
              )}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}

      {progress && (
        <div className="mt-3 space-y-1.5">
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-400">
            <span>Target: Rs. {progress.total.toLocaleString()}</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {progress.percent.toFixed(1)}% Completed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
