'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Payment, PaymentMethod } from '@/types';
import {
  formatCurrency,
  formatDisplayDate,
  formatDateISO,
  getColomboDate,
} from '@/lib/calculations';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function AllPaymentsPage() {
  const { families, payments, currentUser, updatePayment, deletePayment } = useApp();

  // Filters state
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit modal state
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPaidBy, setEditPaidBy] = useState<string>('');
  const [editMethod, setEditMethod] = useState<PaymentMethod>('Cash');
  const [editDate, setEditDate] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editRef, setEditRef] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (selectedFamilyId !== 'all' && p.family_id !== selectedFamilyId) return false;
        if (selectedMethod !== 'all' && p.payment_method !== selectedMethod) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const noteMatch = p.note?.toLowerCase().includes(q);
          const refMatch = p.reference_number?.toLowerCase().includes(q);
          const payerMatch = p.paid_by?.toLowerCase().includes(q);
          const enteredMatch = p.entered_by?.toLowerCase().includes(q);
          if (!noteMatch && !refMatch && !payerMatch && !enteredMatch) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }, [payments, selectedFamilyId, selectedMethod, searchQuery]);

  const totalFilteredSum = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayments]);

  const canEditPayment = (p: Payment) => {
    if (currentUser.role === 'main_admin') return true;
    if (currentUser.role === 'sub_admin') {
      const todayIso = formatDateISO(getColomboDate());
      const pDateIso = formatDateISO(new Date(p.created_at));
      return p.entered_by === currentUser.name && todayIso === pDateIso;
    }
    return false;
  };

  const canDeletePayment = () => {
    return currentUser.role === 'main_admin';
  };

  const startEdit = (p: Payment) => {
    setEditingPayment(p);
    setEditAmount(p.amount);
    setEditPaidBy(p.paid_by);
    setEditMethod(p.payment_method);
    setEditDate(p.payment_date);
    setEditNote(p.note || '');
    setEditRef(p.reference_number || '');
    setActionError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    setActionError(null);
    const res = await updatePayment(editingPayment.id, {
      amount: Number(editAmount),
      paid_by: editPaidBy,
      payment_method: editMethod,
      payment_date: editDate,
      note: editNote || undefined,
      reference_number: editRef || undefined,
    });

    if (res.success) {
      setActionSuccess('Payment updated successfully!');
      setEditingPayment(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || 'Failed to update payment');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deletePayment(id);
    if (res.success) {
      setDeletingId(null);
      setActionSuccess('Payment deleted.');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || 'Failed to delete payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            <span>All Payments Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Complete transaction history across all 4 families with audit trails
          </p>
        </div>

        {currentUser.role !== 'family' && (
          <Link
            href="/payments/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Record Payment</span>
          </Link>
        )}
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Family Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-400 mb-1">
              Filter by Family
            </label>
            <select
              value={selectedFamilyId}
              onChange={(e) => setSelectedFamilyId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All 4 Families</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-400 mb-1">
              Payment Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="BOC">Bank of Ceylon (BOC)</option>
              <option value="Commercial Bank">Commercial Bank</option>
              <option value="Amana Bank">Amana Bank</option>
              <option value="Other">Other / Imported</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-400 mb-1">
              Search Reference / Payer
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, ref, payer..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-stone-500">
            Showing <strong>{filteredPayments.length}</strong> payments
          </span>
          <span className="font-semibold text-stone-900 dark:text-white">
            Total for view: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(totalFilteredSum)}</strong>
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-4">Payer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Ref / Note</th>
                <th className="py-3 px-4">Entered By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400 text-sm">
                    No payments found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const family = families.find((f) => f.id === p.family_id);
                  const editable = canEditPayment(p);
                  const deletable = canDeletePayment();

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {formatDisplayDate(p.payment_date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white whitespace-nowrap">
                        {family?.name || p.family_id}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {p.paid_by}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-700 dark:text-stone-300">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                        {p.note || p.reference_number || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-stone-400 whitespace-nowrap">
                        <span className="font-semibold text-stone-600 dark:text-stone-300">{p.entered_by}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {editable ? (
                            <button
                              onClick={() => startEdit(p)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                              title="Edit payment"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="p-1.5 opacity-20 cursor-not-allowed">
                              <Edit2 className="w-4 h-4" />
                            </span>
                          )}

                          {deletable ? (
                            <button
                              onClick={() => setDeletingId(p.id)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                              title="Delete payment (Main Admin only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="p-1.5 opacity-20 cursor-not-allowed">
                              <Trash2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Edit Payment
              </h3>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-500 mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Paid By</label>
                <input
                  type="text"
                  value={editPaidBy}
                  onChange={(e) => setEditPaidBy(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Method</label>
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="BOC">BOC</option>
                    <option value="Commercial Bank">Commercial Bank</option>
                    <option value="Amana Bank">Amana Bank</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={editRef}
                  onChange={(e) => setEditRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Note</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 font-semibold text-stone-600 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Delete Payment?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete this payment record? All weeks and family balances will automatically recalculate.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
