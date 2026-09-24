'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, ShieldAlert, KeyRound, X, Check, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { loginAsAdmin } = useApp();
  const [selectedRole, setSelectedRole] = useState<'main_admin' | 'sub_admin'>('main_admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredPassword = pin.trim();
    if (!enteredPassword) {
      setError('Password is required.');
      return;
    }

    const result = loginAsAdmin(selectedRole, enteredPassword);

    if (result.success) {
      setSuccess(
        `Welcome, ${selectedRole === 'main_admin' ? 'Mr. Hamas (Main Admin)' : 'Nihla (Sub Admin)'}!`
      );
      setTimeout(() => {
        setSuccess(null);
        setPin('');
        onClose();
      }, 1000);
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Admin Sign In
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Unlock data entry & editing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select User */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sign In As:
            </label>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('main_admin')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedRole === 'main_admin'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    MH
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Mr. Hamas</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                        Main Admin
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Full control & data entry</div>
                  </div>
                </div>
                {selectedRole === 'main_admin' && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('sub_admin')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedRole === 'sub_admin'
                    ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Nihla</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                        Sub Admin
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Authorized data entry</div>
                  </div>
                </div>
                {selectedRole === 'sub_admin' && (
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Admin Password
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
