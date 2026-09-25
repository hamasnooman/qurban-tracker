'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { HAMAS_BANK_ACCOUNTS } from '@/lib/mock-data';
import {
  formatCurrency,
  formatDisplayDate,
  getDaysUntilEid,
  getWeeksDue,
  getWeekDate,
  calculateWeeklyGrid,
  calculateFamilyStatus,
} from '@/lib/calculations';
import { toPng, toBlob } from 'html-to-image';
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';

interface SummaryPngModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'overall' | 'weekly';
}

export function SummaryPngModal({
  isOpen,
  onClose,
  defaultMode = 'overall',
}: SummaryPngModalProps) {
  const { families, payments, settings, financialStatuses, currentUser } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentWeekNumber = getWeeksDue(settings.start_date, undefined, settings.total_weeks);
  const [mode, setMode] = useState<'overall' | 'weekly'>(defaultMode);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekNumber || 1);
  const [theme, setTheme] = useState<'emerald' | 'white'>('emerald');
  const [includeBankDetails, setIncludeBankDetails] = useState(true);

  // Interaction feedback states
  const [isDownloading, setIsDownloading] = useState(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState(false);
  const [copyTextSuccess, setCopyTextSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Aggregate calculations
  const totalCollected = financialStatuses.reduce((acc, s) => acc + s.total_paid, 0);
  const targetAmount = settings.target_amount || 306000;
  const progressPercent = targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
  const daysToEid = getDaysUntilEid(settings.eid_date);
  const currentWeek = currentWeekNumber;

  // Selected week calculations (for weekly mode)
  const weekDate = getWeekDate(settings.start_date, selectedWeek);
  const formattedWeekDate = formatDisplayDate(weekDate);
  const grid = calculateWeeklyGrid(families, payments, settings);
  const targetRow = grid.rows.find((r) => r.week_number === selectedWeek);
  const weeklyStatuses = families.map((fam) => {
    const status = calculateFamilyStatus(fam, payments, settings, weekDate);
    const cell = targetRow?.family_cells[fam.id];
    return { family: fam, status, cell };
  });
  const weekCollectedTotal = targetRow?.row_total || 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper for generating image options
  const getImageOptions = () => ({
    cacheBust: true,
    pixelRatio: 2.5,
    backgroundColor: theme === 'emerald' ? '#042f2e' : '#ffffff',
  });

  // 1. Download PNG Image
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, getImageOptions());
      const link = document.createElement('a');
      const filename =
        mode === 'overall'
          ? `Qurban_Summary_Week_${currentWeek}_Overall.png`
          : `Qurban_Week_${selectedWeek}_Status.png`;

      link.download = filename;
      link.href = dataUrl;
      link.click();
      showToast('✓ PNG downloaded successfully! Ready to share.');
    } catch (err) {
      console.error('Failed to generate PNG:', err);
      showToast('⚠️ Could not generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Copy Image directly to Clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await toBlob(cardRef.current, getImageOptions());
      if (blob && navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopyImageSuccess(true);
        showToast('✓ Image copied to clipboard! Paste directly into WhatsApp (Ctrl+V).');
        setTimeout(() => setCopyImageSuccess(false), 3000);
      } else {
        // Fallback to download if ClipboardItem not supported
        handleDownloadPng();
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      // Fallback to download
      handleDownloadPng();
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Web Share API (Direct to WhatsApp / Messaging apps on mobile/desktop)
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await toBlob(cardRef.current, getImageOptions());
      if (blob) {
        const filename =
          mode === 'overall'
            ? `Qurban_Summary_Week_${currentWeek}.png`
            : `Qurban_Week_${selectedWeek}_Status.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: settings.fund_name,
            text: `🌙 Qurban Family Savings Summary - Week ${currentWeek} update`,
          });
          setShareSuccess(true);
          showToast('✓ Shared successfully!');
          setTimeout(() => setShareSuccess(false), 3000);
        } else {
          // If native share with files is not supported, copy or download
          handleCopyImage();
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share error:', err);
        handleDownloadPng();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // 4. WhatsApp formatted message text
  const handleCopyWhatsappText = () => {
    let text = '';
    if (mode === 'overall') {
      text = `🌙 *${settings.fund_name}*
📅 *Week ${currentWeek} of ${settings.total_weeks} Update* (${formatDisplayDate(new Date().toISOString().slice(0, 10))})
━━━━━━━━━━━━━━━━━━━━

${financialStatuses
  .map(
    (s) =>
      `*${s.family_name}*: ${formatCurrency(s.total_paid)} paid · ${
        s.status === 'ok'
          ? '✅ Up to date'
          : s.status === 'advance'
          ? `🌟 +${s.weeks_ahead}w ahead`
          : `⚠️ ${formatCurrency(Math.abs(s.balance))} due (${s.weeks_behind}w behind)`
      }`
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━
💰 *Total Fund Collected:* ${formatCurrency(totalCollected)} / Rs. ${targetAmount.toLocaleString()} (${progressPercent.toFixed(1)}%)
🎯 *Weekly Target:* Rs. 6,000 (4 families × Rs. 1,500)
🌙 *Days to Eid:* ${daysToEid} Days (~16 May 2027)

🏦 *Bank Accounts for Contributions:*
1️⃣ *Commercial Bank* · A/C: 8016292617 (M N Hamas - Nawala)
2️⃣ *Amana Bank* · A/C: 0110578227001 (MN Hamas - Kurunegala)
3️⃣ *BOC (An-Noor)* · A/C: 96503121 (MN Hamas - Galgamuwa)

_Please send payment confirmation slip to Mr. Hamas on WhatsApp._
Jazakallahu Khairan 🤲 · #QurbanFamily2027`;
    } else {
      text = `🌙 *${settings.fund_name}*
📅 *Week ${selectedWeek} Status Update* (${formattedWeekDate})
━━━━━━━━━━━━━━━━━━━━

${weeklyStatuses
  .map(({ family, cell, status }) => {
    const statusIcon =
      cell?.status === 'paid'
        ? '✅ Paid (Rs. 1,500)'
        : cell?.status === 'part'
        ? `⚠️ Part Paid (${formatCurrency(cell.allocated_amount)})`
        : cell?.status === 'advance'
        ? '🌟 Paid in Advance'
        : '❌ Not paid';

    return `*${family.name}*
• Week ${selectedWeek}: ${statusIcon}
• Total Paid: ${formatCurrency(status.total_paid)}
• Balance: ${status.status_label}`;
  })
  .join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
📊 *Week ${selectedWeek} Total:* ${formatCurrency(weekCollectedTotal)} / Rs. 6,000
💰 *Grand Total Fund:* ${formatCurrency(totalCollected)} / Rs. ${targetAmount.toLocaleString()}

🏦 *Bank Accounts:*
1️⃣ Commercial Bank: 8016292617
2️⃣ Amana Bank: 0110578227001
3️⃣ BOC: 96503121 (Name: MN Hamas)

Jazakallahu Khairan 🤲 · #QurbanFamily2027`;
    }

    navigator.clipboard.writeText(text);
    setCopyTextSuccess(true);
    showToast('✓ WhatsApp text copied to clipboard!');
    setTimeout(() => setCopyTextSuccess(false), 2500);
  };

  const isEmerald = theme === 'emerald';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f141f] rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* ================= MODAL TOP BAR ================= */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-amber-300 flex items-center justify-center shadow-sm text-lg">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Download Summary PNG
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Ready to Share
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-resolution PNG image for WhatsApp & family groups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ================= CONTROLS TOOLBAR ================= */}
        <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Mode & Week Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
              <button
                onClick={() => setMode('overall')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'overall'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overall Fund Summary</span>
              </button>
              <button
                onClick={() => setMode('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'weekly'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Week {selectedWeek} Only</span>
              </button>
            </div>

            {mode === 'weekly' && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-xs">
                <button
                  onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                  disabled={selectedWeek <= 1}
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-slate-900 dark:text-white px-1">
                  Week {selectedWeek}
                </span>
                <button
                  onClick={() => setSelectedWeek((w) => Math.min(settings.total_weeks, w + 1))}
                  disabled={selectedWeek >= settings.total_weeks}
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                  title="Next Week"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Theme Switcher & Bank Details Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setTheme('emerald')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  theme === 'emerald'
                    ? 'bg-emerald-900 text-amber-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🌙</span>
                <span>Royal Emerald</span>
              </button>
              <button
                onClick={() => setTheme('white')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  theme === 'white'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>📄</span>
                <span>Clean White</span>
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeBankDetails}
                onChange={(e) => setIncludeBankDetails(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Bank Details</span>
            </label>
          </div>
        </div>

        {/* ================= SCROLLABLE PREVIEW AREA ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/50 dark:bg-black/40">
          
          {/* ================= THE CAPTURABLE CARD ================= */}
          <div
            ref={cardRef}
            style={{
              width: '100%',
              maxWidth: '620px',
              backgroundColor: isEmerald ? '#042f2e' : '#ffffff',
              color: isEmerald ? '#ffffff' : '#0f172a',
            }}
            className={`rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all space-y-4 ${
              isEmerald ? 'border-emerald-700' : 'border-slate-300'
            }`}
          >
            {/* 1. Header */}
            <div
              className={`pb-4 border-b flex items-center justify-between gap-3 ${
                isEmerald ? 'border-emerald-800/80' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                    isEmerald
                      ? 'bg-emerald-800/90 text-amber-300 border border-emerald-600/50'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  🌙
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isEmerald ? 'text-amber-400' : 'text-emerald-700'
                      }`}
                    >
                      {settings.fund_name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        isEmerald
                          ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      Official
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {mode === 'overall' ? 'Fund Contribution Summary' : `Week ${selectedWeek} Status Card`}
                  </h2>
                  <p
                    className={`text-[11px] font-medium ${
                      isEmerald ? 'text-emerald-200/80' : 'text-slate-500'
                    }`}
                  >
                    Joint Qurban Savings for Eid al-Adha 1448 AH · ~16 May 2027
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                    isEmerald
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  WEEK {mode === 'overall' ? currentWeek : selectedWeek} OF {settings.total_weeks}
                </span>
                <div
                  className={`text-[10px] font-mono mt-1 ${
                    isEmerald ? 'text-emerald-300/80' : 'text-slate-500'
                  }`}
                >
                  {mode === 'overall' ? formatDisplayDate(new Date().toISOString().slice(0, 10)) : formattedWeekDate}
                </div>
              </div>
            </div>

            {/* 2. Key Metrics Bar */}
            <div
              className={`grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl border ${
                isEmerald
                  ? 'bg-emerald-950/70 border-emerald-800 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div>
                <div
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isEmerald ? 'text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  Total Fund Collected
                </div>
                <div
                  className={`text-lg sm:text-xl font-black mt-0.5 ${
                    isEmerald ? 'text-amber-300' : 'text-emerald-700'
                  }`}
                >
                  {formatCurrency(totalCollected)}
                </div>
                <div
                  className={`text-[9px] font-semibold ${
                    isEmerald ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {progressPercent.toFixed(1)}% of {formatCurrency(targetAmount)}
                </div>
              </div>

              <div>
                <div
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isEmerald ? 'text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  Weekly Target
                </div>
                <div className="text-lg sm:text-xl font-black mt-0.5">
                  Rs. 6,000
                </div>
                <div
                  className={`text-[9px] ${
                    isEmerald ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  4 Families · Rs. 1,500/ea
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isEmerald ? 'text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  Countdown to Eid
                </div>
                <div
                  className={`text-lg sm:text-xl font-black mt-0.5 ${
                    isEmerald ? 'text-amber-300' : 'text-amber-600'
                  }`}
                >
                  {daysToEid} Days
                </div>
                <div
                  className={`text-[9px] ${
                    isEmerald ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  ~16 May 2027
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div
              className={`p-2.5 rounded-xl border ${
                isEmerald
                  ? 'bg-emerald-900/50 border-emerald-800'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className={isEmerald ? 'text-emerald-200' : 'text-emerald-900'}>
                  Overall Goal Progress (Rs. 306,000)
                </span>
                <span className={isEmerald ? 'text-amber-300 font-mono font-black' : 'text-emerald-800 font-mono font-black'}>
                  {progressPercent.toFixed(1)}% Completed
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  isEmerald ? 'bg-emerald-950' : 'bg-slate-200'
                }`}
              >
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>

            {/* 3. Family List (High Contrast, Crystal Clear) */}
            <div className="space-y-2">
              <div
                className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-between px-1 ${
                  isEmerald ? 'text-emerald-300' : 'text-slate-500'
                }`}
              >
                <span>Family Member</span>
                <span>{mode === 'overall' ? 'Total Paid & Status' : `Week ${selectedWeek} Status`}</span>
              </div>

              {mode === 'overall' ? (
                // Overall Mode Rows
                financialStatuses.map((s) => {
                  const isDue = s.status === 'due';
                  const isAdvance = s.status === 'advance';

                  return (
                    <div
                      key={s.family_id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                        isEmerald
                          ? 'bg-emerald-900/40 border-emerald-800 hover:border-emerald-600'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div
                          className={`font-black text-sm tracking-tight ${
                            isEmerald ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {s.family_name}
                        </div>
                        <div
                          className={`text-[11px] font-medium ${
                            isEmerald ? 'text-emerald-300' : 'text-slate-500'
                          }`}
                        >
                          Total Paid: <strong className={isEmerald ? 'text-amber-300' : 'text-emerald-700'}>{formatCurrency(s.total_paid)}</strong>
                          <span className="opacity-75"> · {(s.total_paid / 1500).toFixed(0)} of 51 wks</span>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        {isDue ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <span>⚠️</span>
                            <span>{formatCurrency(Math.abs(s.balance))} due</span>
                          </span>
                        ) : isAdvance ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            <span>🌟</span>
                            <span>+{formatCurrency(s.balance)} ahead</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            <span>✅</span>
                            <span>Up to date (W{currentWeek})</span>
                          </span>
                        )}

                        <div
                          className={`text-[10px] font-semibold ${
                            isDue
                              ? 'text-rose-500'
                              : isEmerald
                              ? 'text-emerald-300/80'
                              : 'text-slate-500'
                          }`}
                        >
                          {isDue ? `${s.weeks_behind} weeks behind` : isAdvance ? `${s.weeks_ahead} weeks ahead` : 'All dues cleared'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Weekly Mode Rows
                weeklyStatuses.map(({ family, cell, status }) => {
                  const isPaid = cell?.status === 'paid';
                  const isPart = cell?.status === 'part';
                  const isAdv = cell?.status === 'advance';

                  return (
                    <div
                      key={family.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border ${
                        isEmerald
                          ? 'bg-emerald-900/40 border-emerald-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div
                          className={`font-black text-sm tracking-tight ${
                            isEmerald ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {family.name}
                        </div>
                        <div
                          className={`text-[11px] ${
                            isEmerald ? 'text-emerald-300' : 'text-slate-500'
                          }`}
                        >
                          Total Paid: <strong className={isEmerald ? 'text-amber-300' : 'text-emerald-700'}>{formatCurrency(status.total_paid)}</strong>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            isPaid
                              ? isEmerald
                                ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isPart
                              ? isEmerald
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isAdv
                              ? isEmerald
                                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                              : isEmerald
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {cell ? cell.label : 'Not paid'}
                        </span>
                        <div
                          className={`text-[10px] font-semibold ${
                            status.status === 'due'
                              ? 'text-rose-500'
                              : isEmerald
                              ? 'text-emerald-300/80'
                              : 'text-slate-500'
                          }`}
                        >
                          {status.status_label}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. Bank Accounts Section (Crucial for Sharing) */}
            {includeBankDetails && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isEmerald
                    ? 'bg-emerald-950/90 border-emerald-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className={`w-3.5 h-3.5 ${isEmerald ? 'text-amber-400' : 'text-emerald-700'}`} />
                    <span className="text-[10px] uppercase font-black tracking-wider">
                      Bank Accounts for Weekly Contribution (Rs. 1,500)
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono ${isEmerald ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Transfer Slip to Admin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {HAMAS_BANK_ACCOUNTS.map((acc, idx) => (
                    <div
                      key={acc.account_number}
                      className={`p-2 rounded-xl border text-[11px] ${
                        isEmerald
                          ? 'bg-emerald-900/50 border-emerald-700/80'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="font-extrabold text-[11px] truncate flex items-center justify-between">
                        <span>{acc.bank_name}</span>
                        <span className="text-[9px] opacity-60">#{idx + 1}</span>
                      </div>
                      <div
                        className={`font-mono font-black text-xs tracking-wider mt-0.5 ${
                          isEmerald ? 'text-amber-300' : 'text-emerald-700'
                        }`}
                      >
                        {acc.account_number}
                      </div>
                      <div className="text-[10px] opacity-80 truncate mt-0.5">
                        {acc.account_name} · {acc.branch}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Footer */}
            <div
              className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-medium ${
                isEmerald
                  ? 'border-emerald-800/80 text-emerald-300/80'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              <div>
                Verified by Mr. Hamas (Main Admin) · Please send slip on WhatsApp
              </div>
              <div className="text-left sm:text-right font-mono text-[9px]">
                #QurbanFamily2027 · Jazakallahu Khairan 🤲
              </div>
            </div>
          </div>
        </div>

        {/* ================= MODAL BOTTOM ACTION BAR ================= */}
        <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">Format:</span> 2.5x High-DPI PNG (Crisp for mobile screens)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isDownloading ? 'Generating Image...' : 'Download PNG'}</span>
            </button>

            {/* Copy Image directly to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isDownloading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Copy image to clipboard to paste directly into WhatsApp Web or Telegram (Ctrl+V)"
            >
              {copyImageSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Image Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* Web Share (Direct to WhatsApp / Apps on Mobile) */}
            <button
              onClick={handleShareImage}
              disabled={isDownloading}
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Share image directly via WhatsApp or mobile share sheet"
            >
              {shareSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Shared!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Image</span>
                </>
              )}
            </button>

            {/* WhatsApp Text Copy */}
            <button
              onClick={handleCopyWhatsappText}
              className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted WhatsApp message text"
            >
              {copyTextSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Text Copied!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
