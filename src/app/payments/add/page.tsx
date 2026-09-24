'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PaymentMethod } from '@/types';
import {
  formatCurrency,
  formatDateISO,
  getColomboDate,
  previewPaymentImpact,
} from '@/lib/calculations';
import {
  PlusCircle,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

function AddPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { families, payments, settings, currentUser, addPayment } = useApp();

  const preselectedFamilyId = searchParams.get('family') || families[0]?.id || '';

  const [familyId, setFamilyId] = useState(preselectedFamilyId);
  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentDate, setPaymentDate] = useState(formatDateISO(getColomboDate()));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const selectedFamily = families.find((f) => f.id === familyId) || families[0];

  // Update paidBy default when selected family changes
  useEffect(() => {
    if (selectedFamily) {
      setPaidBy(selectedFamily.husband_name || selectedFamily.name);
    }
  }, [familyId, selectedFamily]);

  // Live preview calculation using our single shared calculation function!
  const previewText = selectedFamily
    ? previewPaymentImpact(selectedFamily, payments, amount, settings)
    : '';

  const handleQuickAmount = (val: number) => {
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) return;

    if (currentUser.role === 'family') {
      setMessage({
        type: 'error',
        text: 'Family accounts have read-only access and cannot enter payments.',
      });
      return;
    }

    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than Rs. 0' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const res = await addPayment({
      family_id: familyId,
      amount: Number(amount),
      paid_by: paidBy || selectedFamily.name,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber.trim() || undefined,
      note: note.trim() || undefined,
      entered_by: currentUser.name,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Payment of ${formatCurrency(amount)} recorded successfully for ${
          selectedFamily.name
        }!`,
      });
      setTimeout(() => {
        router.push('/payments');
      }, 1200);
    } else {
      setMessage({
        type: 'error',
        text: res.error || 'Failed to record payment.',
      });
    }
  };

  const isReadOnly = currentUser.role === 'family';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
              Record New Payment
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Contribution will be allocated chronologically to oldest unpaid week
            </p>
          </div>
        </div>
        <div className="text-xs text-stone-400">
          Entering as: <strong className="text-stone-700 dark:text-stone-200">{currentUser.name}</strong>
        </div>
      </div>

      {/* Read only alert if role is family */}
      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Read-only role active:</strong> You are currently viewing as a Family member.
            Switch to <strong>Main Admin</strong> or <strong>Sub Admin</strong> in the menu or sidebar to record payments.
          </div>
        </div>
      )}

      {/* Success / Error Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5"
      >
        {/* 1. Family Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Select Family *
          </label>
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            disabled={isReadOnly}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            {families.map((fam) => (
              <option key={fam.id} value={fam.id}>
                {fam.name} ({fam.family_title})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Paid By (Husband or Wife Name) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Paid By (Payer Name) *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedFamily && (
              <>
                <button
                  type="button"
                  onClick={() => setPaidBy(selectedFamily.husband_name || selectedFamily.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paidBy === (selectedFamily.husband_name || selectedFamily.name)
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  👨 {selectedFamily.husband_name || selectedFamily.name}
                </button>
                {selectedFamily.wife_name && selectedFamily.wife_name.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setPaidBy(selectedFamily.wife_name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      paidBy === selectedFamily.wife_name
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    🧕 {selectedFamily.wife_name}
                  </button>
                )}
              </>
            )}
          </div>
          <input
            type="text"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            placeholder="Payer name"
            disabled={isReadOnly}
            required
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* 3. Amount & Quick Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Payment Amount (LKR) *
            </label>
            <span className="text-xs text-stone-400">1 Week = Rs. 1,500</span>
          </div>

          {/* Quick Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickAmount(1500)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                amount === 1500
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500'
              }`}
            >
              Rs. 1,500 <span className="font-normal block text-[10px] opacity-80">(1 Week)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAmount(3000)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                amount === 3000
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500'
              }`}
            >
              Rs. 3,000 <span className="font-normal block text-[10px] opacity-80">(2 Weeks)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAmount(6000)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                amount === 6000
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500'
              }`}
            >
              Rs. 6,000 <span className="font-normal block text-[10px] opacity-80">(4 Weeks)</span>
            </button>
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3.5 top-3 text-stone-400 font-bold text-sm">Rs.</span>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 1500"
              disabled={isReadOnly}
              required
              min={1}
              step="any"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* 4. Live Calculation Preview Callout */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300">
              Live Impact Preview
            </div>
            <p className="text-xs font-semibold text-stone-900 dark:text-white mt-1">
              {previewText}
            </p>
          </div>
        </div>

        {/* 5. Date & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isReadOnly}
              required
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={isReadOnly}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Cash">Cash (Handed over)</option>
              <option value="BOC">Bank of Ceylon (BOC)</option>
              <option value="Commercial Bank">Commercial Bank</option>
              <option value="Amana Bank">Amana Bank</option>
              <option value="Other">Other / Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* 6. Reference Number & Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Reference # (Optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. TXN-89342 or Cash slip"
              disabled={isReadOnly}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid for 2 weeks advance"
              disabled={isReadOnly}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isReadOnly}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5 text-amber-300" />
            <span>{isSubmitting ? 'Saving Payment...' : `Save Payment of ${formatCurrency(amount)}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddPaymentPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading form...</div>}>
      <AddPaymentForm />
    </Suspense>
  );
}
