'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  calculateFamilyStatus,
  formatCurrency,
  formatDisplayDate,
  getWeeksDue,
} from '@/lib/calculations';
import {
  Users,
  PlusCircle,
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Share2,
} from 'lucide-react';

export default function FamilyPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = (params?.id as string) || 'fam-nooman';
  const { families, payments, settings, currentUser } = useApp();

  const family = families.find((f) => f.id === familyId) || families[0];

  const status = useMemo(() => {
    if (!family) return null;
    return calculateFamilyStatus(family, payments, settings);
  }, [family, payments, settings]);

  // Family's payments sorted oldest to newest to compute running balance, then reversed for display
  const familyPayments = useMemo(() => {
    if (!family) return [];
    const raw = payments
      .filter((p) => p.family_id === family.id)
      .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

    let runningTotal = 0;
    const withRunning = raw.map((p) => {
      runningTotal += Number(p.amount) || 0;
      return {
        ...p,
        running_total: runningTotal,
      };
    });

    return withRunning.reverse();
  }, [family, payments]);

  if (!family || !status) {
    return (
      <div className="p-8 text-center text-stone-500">
        Family not found. <Link href="/" className="text-emerald-600 underline">Return home</Link>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (status.status) {
      case 'advance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {status.status_label}
          </span>
        );
      case 'ok':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Up to date ✅
          </span>
        );
      case 'due':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            {status.status_label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation & Family Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {family.name}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {family.family_title} · Individual Ledger & Balance
            </p>
          </div>
        </div>

        {/* Family Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-400">Family:</label>
          <select
            value={family.id}
            onChange={(e) => router.push(`/family/${e.target.value}`)}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile & Financial Summary Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {family.family_title}
              </h2>
              {getStatusBadge()}
            </div>

            {/* Contact numbers */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-400">Husband:</span>
                <span>{family.husband_name}</span>
                <span className="font-mono text-stone-400">({family.husband_phone || 'No phone'})</span>
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-400">Wife:</span>
                <span>{family.wife_name}</span>
                <span className="font-mono text-stone-400">({family.wife_phone || 'No phone'})</span>
              </span>
            </div>
          </div>

          {currentUser.role !== 'family' && (
            <Link
              href={`/payments/add?family=${family.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Add Payment for {family.name}</span>
            </Link>
          )}
        </div>

        {/* Key Figures Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <div className="text-[10px] uppercase font-bold text-stone-400">Total Paid</div>
            <div className="text-xl font-black text-stone-900 dark:text-white mt-1">
              {formatCurrency(status.total_paid)}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {(status.total_paid / settings.weekly_amount).toFixed(1)} weeks paid
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <div className="text-[10px] uppercase font-bold text-stone-400">Expected (W1–{status.weeks_due})</div>
            <div className="text-xl font-bold text-stone-700 dark:text-stone-300 mt-1">
              {formatCurrency(status.expected_amount)}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {status.weeks_due} weeks elapsed
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              status.status === 'due'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                : status.status === 'advance'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-stone-500">Current Balance</div>
            <div
              className={`text-xl font-black mt-1 ${
                status.status === 'due'
                  ? 'text-rose-700 dark:text-rose-400'
                  : status.status === 'advance'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {status.balance === 0
                ? 'Rs. 0'
                : status.balance > 0
                ? `+${formatCurrency(status.balance)}`
                : formatCurrency(status.balance)}
            </div>
            <div className="text-[11px] font-medium text-stone-600 dark:text-stone-300 mt-0.5">
              {status.status === 'due'
                ? `${status.weeks_behind} weeks behind`
                : status.status === 'advance'
                ? `${status.weeks_ahead} weeks ahead`
                : 'Up to date'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <div className="text-[10px] uppercase font-bold text-stone-400">Remaining to Target</div>
            <div className="text-xl font-bold text-stone-800 dark:text-stone-200 mt-1">
              {formatCurrency(settings.total_weeks * settings.weekly_amount - status.total_paid)}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Target: Rs. {(settings.total_weeks * settings.weekly_amount).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Full Payment Ledger
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              All transactions recorded for {family.name}
            </p>
          </div>
          <span className="text-xs text-stone-400">
            Total transactions: <strong>{familyPayments.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase font-semibold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Payer</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Amount Paid</th>
                <th className="py-3 px-3">Cumulative Paid</th>
                <th className="py-3 px-3">Reference / Note</th>
                <th className="py-3 px-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {familyPayments.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="py-3.5 px-3 font-mono text-stone-700 dark:text-stone-300 whitespace-nowrap">
                    {formatDisplayDate(p.payment_date)}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-stone-900 dark:text-white whitespace-nowrap">
                    {p.paid_by}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300">
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    +{formatCurrency(p.amount)}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                    {formatCurrency(p.running_total)}
                  </td>
                  <td className="py-3.5 px-3 text-stone-500 max-w-xs truncate">
                    {p.note || p.reference_number || '—'}
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-stone-400 whitespace-nowrap">
                    {p.entered_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
