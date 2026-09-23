'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/components/StatCard';
import { FamilyCard } from '@/components/FamilyCard';
import { Charts } from '@/components/Charts';
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

  if (!isInitialized) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-stone-200 dark:bg-stone-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate Metrics
  const totalCollected = financialStatuses.reduce((acc, s) => acc + s.total_paid, 0);
  const targetAmount = settings.target_amount || 306000;
  const progressPercent = targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
  const daysToEid = getDaysUntilEid(settings.eid_date);
  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);

  // This Week Collections
  const thisWeekPayments = payments.filter((p) => {
    if (p.reference_number?.includes(`W${currentWeek}-`)) return true;
    const startDate = new Date(settings.start_date + 'T00:00:00');
    const wStart = new Date(startDate);
    wStart.setDate(wStart.getDate() + (currentWeek - 1) * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 6);
    const pDate = new Date(p.payment_date + 'T00:00:00');
    return pDate >= wStart && pDate <= wEnd;
  });
  const thisWeekCollected = thisWeekPayments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );

  // Behind families
  const behindFamilies = financialStatuses.filter((s) => s.status === 'due');

  // Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Clean, Simple Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-5 sm:p-6 shadow-sm border border-emerald-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <span>🌙 Week {currentWeek} of {settings.total_weeks}</span>
            <span>·</span>
            <span>4 Families</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
            {settings.fund_name}
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Rs. 1,500/week per family · Joint Qurban 2027
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser.role !== 'family' && (
            <Link
              href="/payments/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Payment</span>
            </Link>
          )}
          <Link
            href="/weekly-card"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4 text-amber-300" />
            <span>WhatsApp Card</span>
          </Link>
        </div>
      </div>

      {/* Clean alert mark only for outstanding (NOT full red) */}
      {behindFamilies.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <span className="text-stone-700 dark:text-stone-300">
              <strong className="font-semibold text-rose-600 dark:text-rose-400">Due: </strong>
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
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0"
          >
            View Weekly Grid →
          </Link>
        </div>
      )}

      {/* Clean Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          subtitle={`Target: ${formatCurrency(targetAmount)}`}
          icon="🪙"
          badge={{
            text: `${progressPercent.toFixed(0)}%`,
            variant: 'green',
          }}
          progress={{
            current: totalCollected,
            total: targetAmount,
            percent: progressPercent,
          }}
        />

        <StatCard
          title={`This Week (W${currentWeek})`}
          value={formatCurrency(thisWeekCollected)}
          subtitle="Target: Rs. 6,000 / week"
          icon="📅"
          badge={{
            text: thisWeekCollected >= 6000 ? 'Met ✅' : `Rs. ${(6000 - thisWeekCollected).toLocaleString()} left`,
            variant: thisWeekCollected >= 6000 ? 'green' : 'amber',
          }}
        />

        <StatCard
          title="Days to Eid"
          value={`${daysToEid} Days`}
          subtitle={formatDisplayDate(settings.eid_date)}
          icon="🌙"
          badge={{
            text: `Week ${currentWeek}`,
            variant: 'blue',
          }}
        />

        <StatCard
          title="Target Fund"
          value={formatCurrency(targetAmount)}
          subtitle="51 weeks × Rs. 6,000"
          icon="🎯"
          badge={{
            text: '51 Weeks',
            variant: 'green',
          }}
        />
      </div>

      {/* 4 Family Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Family Contributions
          </h2>
          <Link
            href="/tracker"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>51-Week Grid</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {financialStatuses.map((status) => (
            <FamilyCard key={status.family_id} status={status} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <Charts payments={payments} settings={settings} />

      {/* Recent Payments Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">
            Recent Payments
          </h2>
          <Link
            href="/payments"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({payments.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase font-semibold text-[11px]">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Family</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Method</th>
                <th className="py-2 px-3">Reference / Note</th>
                <th className="py-2 px-3 text-right">Entered By</th>
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
                    <td className="py-2.5 px-3 text-stone-500 truncate max-w-xs">
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
