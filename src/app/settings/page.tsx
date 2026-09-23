'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  formatCurrency,
  formatDisplayDate,
  getColomboDate,
  formatDateISO,
} from '@/lib/calculations';
import {
  Settings,
  ShieldCheck,
  Building2,
  Users,
  MessageSquare,
  Send,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  Phone,
  Radio,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    families,
    users,
    currentUser,
    smsLogs,
    updateSettings,
    updateFamily,
    triggerWeeklySMS,
    resetToSeedData,
  } = useApp();

  // Local state for settings form
  const [formData, setFormData] = useState({
    fund_name: settings.fund_name,
    weekly_amount: settings.weekly_amount,
    total_weeks: settings.total_weeks,
    start_date: settings.start_date,
    eid_date: settings.eid_date,
    target_amount: settings.target_amount,
    footer_text: settings.footer_text,
    sms_enabled: settings.sms_enabled,
    sms_template_due: settings.sms_template_due,
    sms_template_paid: settings.sms_template_paid,
    bank_account_name: settings.bank_details.account_name,
    bank_name: settings.bank_details.bank_name,
    bank_account_number: settings.bank_details.account_number,
    bank_branch: settings.bank_details.branch,
  });

  // Local state for family edits
  const [familyData, setFamilyData] = useState(families);

  // SMS test phone
  const [testPhone, setTestPhone] = useState('+94771234561');
  const [smsSending, setSmsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const isMainAdmin = currentUser.role === 'main_admin';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAdmin) return;

    setMessage(null);
    const res = await updateSettings({
      fund_name: formData.fund_name,
      weekly_amount: Number(formData.weekly_amount),
      total_weeks: Number(formData.total_weeks),
      start_date: formData.start_date,
      eid_date: formData.eid_date,
      target_amount: Number(formData.target_amount),
      footer_text: formData.footer_text,
      sms_enabled: formData.sms_enabled,
      sms_template_due: formData.sms_template_due,
      sms_template_paid: formData.sms_template_paid,
      bank_details: {
        account_name: formData.bank_account_name,
        bank_name: formData.bank_name,
        account_number: formData.bank_account_number,
        branch: formData.bank_branch,
      },
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Fund settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save settings' });
    }
  };

  const handleFamilyChange = (id: string, field: string, value: string) => {
    setFamilyData((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleSaveFamily = async (id: string) => {
    if (!isMainAdmin) return;
    const fam = familyData.find((f) => f.id === id);
    if (!fam) return;

    const res = await updateFamily(id, fam);
    if (res.success) {
      setMessage({ type: 'success', text: `Saved details for ${fam.name}!` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update family' });
    }
  };

  const handleTestSMS = async () => {
    setSmsSending(true);
    setMessage(null);
    const res = await triggerWeeklySMS('test', testPhone);
    setSmsSending(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleRunWeeklySMS = async () => {
    if (
      !confirm(
        'Are you sure you want to trigger the weekly SMS run for all families right now? This will send messages to both husband and wife.'
      )
    ) {
      return;
    }

    setSmsSending(true);
    setMessage(null);
    const res = await triggerWeeklySMS('all');
    setSmsSending(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            <span>Settings & Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Fund parameters, family profiles, bank details, and weekly SMS automation
          </p>
        </div>

        {isMainAdmin && (
          <button
            onClick={() => {
              if (confirm('Reset all data to the initial W1–W10 seed data (Rs. 55,500 total)?')) {
                resetToSeedData();
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Seed Data</span>
          </button>
        )}
      </div>

      {/* Permission alert if not main admin */}
      {!isMainAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Restricted Access:</strong> You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.role}).
            Only the <strong>Main Admin</strong> can modify fund settings, bank details, and SMS triggers.
          </div>
        </div>
      )}

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. FUND SETTINGS */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            Fund Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-500 mb-1">Fund Name</label>
            <input
              type="text"
              value={formData.fund_name}
              onChange={(e) => setFormData({ ...formData, fund_name: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-500 mb-1">Weekly Amount per Family (Rs.)</label>
            <input
              type="number"
              value={formData.weekly_amount}
              onChange={(e) => setFormData({ ...formData, weekly_amount: Number(e.target.value) })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-500 mb-1">Target Amount (Rs.)</label>
            <input
              type="number"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-500 mb-1">Start Date (Week 1)</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-500 mb-1">Eid al-Adha 2027 Date</label>
            <input
              type="date"
              value={formData.eid_date}
              onChange={(e) => setFormData({ ...formData, eid_date: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-500 mb-1">Footer Text</label>
            <input
              type="text"
              value={formData.footer_text}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>
        </div>

        {/* Bank Account Section */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <h3 className="font-bold text-xs uppercase text-stone-400 tracking-wider">
            Bank Account Details (Included in SMS & Cards)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-500 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                disabled={!isMainAdmin}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-500 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.bank_account_name}
                onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                disabled={!isMainAdmin}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-500 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                disabled={!isMainAdmin}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-500 mb-1">Branch</label>
              <input
                type="text"
                value={formData.bank_branch}
                onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                disabled={!isMainAdmin}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {isMainAdmin && (
          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Fund Settings</span>
            </button>
          </div>
        )}
      </form>

      {/* 2. FAMILY DETAILS & CONTACT NUMBERS */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            4 Families & Phone Numbers (SMS Recipients)
          </h2>
        </div>

        <div className="space-y-4">
          {familyData.map((fam) => (
            <div
              key={fam.id}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                  {fam.name} ({fam.family_title})
                </span>
                {isMainAdmin && (
                  <button
                    type="button"
                    onClick={() => handleSaveFamily(fam.id)}
                    className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    Update
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-400 mb-1">Husband Name</label>
                  <input
                    type="text"
                    value={fam.husband_name}
                    onChange={(e) => handleFamilyChange(fam.id, 'husband_name', e.target.value)}
                    disabled={!isMainAdmin}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-400 mb-1">Husband Phone</label>
                  <input
                    type="text"
                    value={fam.husband_phone}
                    onChange={(e) => handleFamilyChange(fam.id, 'husband_phone', e.target.value)}
                    disabled={!isMainAdmin}
                    placeholder="+9477xxxxxxx"
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-400 mb-1">Wife Name</label>
                  <input
                    type="text"
                    value={fam.wife_name}
                    onChange={(e) => handleFamilyChange(fam.id, 'wife_name', e.target.value)}
                    disabled={!isMainAdmin}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-400 mb-1">Wife Phone</label>
                  <input
                    type="text"
                    value={fam.wife_phone}
                    onChange={(e) => handleFamilyChange(fam.id, 'wife_phone', e.target.value)}
                    disabled={!isMainAdmin}
                    placeholder="+9477xxxxxxx"
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. WEEKLY SMS CONTROLS & NOTIFY.LK */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Weekly SMS Automation (Notify.lk)
              </h2>
              <p className="text-xs text-stone-500">
                Scheduled: Every Thursday at 8:00 PM Sri Lanka time (14:30 UTC via Vercel Cron)
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
              SMS {formData.sms_enabled ? 'ON' : 'OFF'}
            </span>
            <input
              type="checkbox"
              checked={formData.sms_enabled}
              onChange={(e) => setFormData({ ...formData, sms_enabled: e.target.checked })}
              disabled={!isMainAdmin}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>

        {/* SMS Message Templates */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-600 dark:text-stone-300 mb-1">
              Due Payment Message Template
            </label>
            <textarea
              rows={3}
              value={formData.sms_template_due}
              onChange={(e) => setFormData({ ...formData, sms_template_due: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-stone-400">
              Variables: {'{FAMILY}'}, {'{PAID}'}, {'{DUE}'}, {'{NAME}'}, {'{BANK}'}, {'{ACCOUNT}'}
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-600 dark:text-stone-300 mb-1">
              Up-to-date / Advance Thank You Message Template
            </label>
            <textarea
              rows={2}
              value={formData.sms_template_paid}
              onChange={(e) => setFormData({ ...formData, sms_template_paid: e.target.value })}
              disabled={!isMainAdmin}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-stone-400">
              Variables: {'{FAMILY}'}, {'{PAID}'}
            </span>
          </div>
        </div>

        {/* Admin Manual Triggers */}
        {isMainAdmin && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <h3 className="font-bold text-xs uppercase text-stone-400 tracking-wider">
              Manual SMS Actions
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+9477xxxxxxx"
                className="w-full sm:w-60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleTestSMS}
                disabled={smsSending}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test SMS to Me</span>
              </button>

              <button
                type="button"
                onClick={handleRunWeeklySMS}
                disabled={smsSending}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Send Weekly SMS Now</span>
              </button>
            </div>
            <div className="text-[11px] text-stone-400">
              * Protected by weekly deduplication: will never send twice to the same number in the same week.
            </div>
          </div>
        )}

        {/* SMS Delivery Logs */}
        <div>
          <h3 className="font-bold text-xs uppercase text-stone-400 tracking-wider mb-2">
            Recent SMS Delivery Logs
          </h3>
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 max-h-48">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Recipient</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Message Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No SMS sent yet. Use "Send Test SMS" above to test.
                    </td>
                  </tr>
                ) : (
                  smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-2.5 px-3 font-mono text-stone-500">
                        {new Date(log.sent_at).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-800 dark:text-stone-200">
                        {log.recipient_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-500">{log.phone_number}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 truncate max-w-xs">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. USER ROLE MANAGEMENT */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            User Accounts & Role Permissions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-emerald-700 dark:text-emerald-400">Main Admin (Data Entry & Control)</div>
            <div className="font-semibold text-stone-800 dark:text-stone-200 mt-1">Mr. Hamas</div>
            <p className="text-[11px] text-stone-500 mt-1">
              Full control: enter/edit/delete payments, manage fund settings, family profiles, and trigger SMS.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-amber-700 dark:text-amber-400">Sub Admin (Authorized Data Entry)</div>
            <div className="font-semibold text-stone-800 dark:text-stone-200 mt-1">Nihla</div>
            <p className="text-[11px] text-stone-500 mt-1">
              Authorized data entry: can record payments, and edit her own entries on the same day.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-blue-700 dark:text-blue-400">Family Members (Read-Only)</div>
            <div className="font-semibold text-stone-800 dark:text-stone-200 mt-1">Mr. Nooman, Mr. Rikaz, Mr. Haneef</div>
            <p className="text-[11px] text-stone-500 mt-1">
              Strictly read-only access to dashboard, 51-week tracker, ledger statements, and WhatsApp cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
