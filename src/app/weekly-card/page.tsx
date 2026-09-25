'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  calculateWeeklyGrid,
  calculateFamilyStatus,
  formatCurrency,
  formatDisplayDate,
  getWeekDate,
  getWeeksDue,
} from '@/lib/calculations';
import { toPng, toBlob } from 'html-to-image';
import {
  Share2,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { SummaryPngModal } from '@/components/SummaryPngModal';

export default function WeeklyCardPage() {
  const { families, payments, settings } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentWeekNumber = getWeeksDue(settings.start_date, undefined, settings.total_weeks);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekNumber || 1);
  const [cardTheme, setCardTheme] = useState<'white' | 'dark'>('white');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  // Compute status for the selected week
  const weekDate = getWeekDate(settings.start_date, selectedWeek);
  const formattedWeekDate = formatDisplayDate(weekDate);

  // Grid calculations for this week
  const grid = calculateWeeklyGrid(families, payments, settings);
  const targetRow = grid.rows.find((r) => r.week_number === selectedWeek);

  // Status for each family
  const familyStatuses = families.map((fam) => {
    const status = calculateFamilyStatus(fam, payments, settings, weekDate);
    const cell = targetRow?.family_cells[fam.id];
    return {
      family: fam,
      status,
      cell,
    };
  });

  const weekCollectedTotal = targetRow?.row_total || 0;
  const grandTotalCollected = grid.grandTotal;

  // WhatsApp formatted message text
  const whatsappMessageText = `🌙 *Qurban Family Savings Tracker 2026/27*
📅 *Week ${selectedWeek} Summary* (${formattedWeekDate})
━━━━━━━━━━━━━━━━━━━━

${familyStatuses
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
💰 *Grand Total Fund:* ${formatCurrency(grandTotalCollected)} / Rs. ${settings.target_amount.toLocaleString()}

🏦 *Bank Account Details:*
${settings.bank_details.bank_name}
A/C: ${settings.bank_details.account_number}
Name: ${settings.bank_details.account_name}

Jazakallahu Khairan 🤲 · #QurbanFamily2027`;

  // Download card as PNG
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: cardTheme === 'white' ? '#ffffff' : '#042f2e',
      });

      const link = document.createElement('a');
      link.download = `Qurban_Fund_Week_${selectedWeek}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy card directly to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: cardTheme === 'white' ? '#ffffff' : '#042f2e',
      });

      if (blob && navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopyImageSuccess(true);
        setTimeout(() => setCopyImageSuccess(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      handleDownloadImage();
    } finally {
      setIsDownloading(false);
    }
  };

  // Web Share API
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: cardTheme === 'white' ? '#ffffff' : '#042f2e',
      });

      if (blob) {
        const file = new File([blob], `Qurban_Fund_Week_${selectedWeek}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Qurban Fund Week ${selectedWeek} Summary`,
            text: `🌙 Qurban Family Savings - Week ${selectedWeek} Card`,
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2500);
        } else {
          handleCopyImage();
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share error:', err);
        handleDownloadImage();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy WhatsApp formatted text
  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsappMessageText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Summary & Accounts</span>
        </Link>

        <button
          onClick={() => setSummaryModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Download overall fund summary PNG"
        >
          <Layers className="w-3.5 h-3.5 text-slate-950" />
          <span>Overall Fund Summary PNG</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            <span>Weekly Card & WhatsApp Share</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Clean, high-contrast summary card & ready-to-copy WhatsApp message
          </p>
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            disabled={selectedWeek <= 1}
            className="p-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs px-2 text-stone-900 dark:text-white">
            Week {selectedWeek} of {settings.total_weeks}
          </span>
          <button
            onClick={() => setSelectedWeek((w) => Math.min(settings.total_weeks, w + 1))}
            disabled={selectedWeek >= settings.total_weeks}
            className="p-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons & Theme Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCardTheme('white')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cardTheme === 'white'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            Clean White Card
          </button>
          <button
            onClick={() => setCardTheme('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cardTheme === 'dark'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            Emerald Theme
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyImage}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Copy image to clipboard (paste in WhatsApp Web / Ctrl+V)"
          >
            {copyImageSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Image Copied!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          {/* Share Image Button */}
          <button
            onClick={handleShareImage}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Share image via mobile WhatsApp / apps"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Shared!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Copy Text Button */}
          <button
            onClick={handleCopyWhatsAppText}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= THE HIGH-CONTRAST CARD (100% CLEAR TEXT) ================= */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-lg border transition-all ${
            cardTheme === 'white'
              ? 'bg-white text-stone-900 border-stone-300'
              : 'bg-emerald-950 text-white border-emerald-700'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3.5 border-b ${
              cardTheme === 'white' ? 'border-stone-200' : 'border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌙</span>
              <div>
                <h3
                  className={`font-black text-base tracking-tight flex items-center gap-1 ${
                    cardTheme === 'white' ? 'text-stone-950' : 'text-white'
                  }`}
                >
                  <span>Qurban Fund 2026/27</span>
                  <span>🐄</span>
                </h3>
                <p
                  className={`text-xs font-semibold ${
                    cardTheme === 'white' ? 'text-emerald-700' : 'text-amber-300'
                  }`}
                >
                  Weekly Status Card
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-black ${
                  cardTheme === 'white'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                WEEK {selectedWeek}
              </span>
              <div
                className={`text-[11px] font-mono mt-0.5 ${
                  cardTheme === 'white' ? 'text-stone-500' : 'text-stone-300'
                }`}
              >
                {formattedWeekDate}
              </div>
            </div>
          </div>

          {/* Family List: High Contrast & Crystal Clear Text */}
          <div className="my-4 space-y-2">
            {familyStatuses.map(({ family, cell, status }) => {
              const isPaid = cell?.status === 'paid';
              const isPart = cell?.status === 'part';
              const isAdv = cell?.status === 'advance';

              return (
                <div
                  key={family.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    cardTheme === 'white'
                      ? 'bg-stone-50 border-stone-200'
                      : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <div>
                    <div
                      className={`font-extrabold text-sm ${
                        cardTheme === 'white' ? 'text-stone-900' : 'text-white'
                      }`}
                    >
                      {family.name}
                    </div>
                    <div
                      className={`text-xs ${
                        cardTheme === 'white' ? 'text-stone-500' : 'text-stone-300'
                      }`}
                    >
                      Total Paid: <strong className={cardTheme === 'white' ? 'text-stone-900' : 'text-white'}>{formatCurrency(status.total_paid)}</strong>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPart
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isAdv
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {cell ? cell.label : 'Not paid'}
                    </span>
                    <div
                      className={`text-[11px] font-semibold ${
                        status.status === 'due'
                          ? 'text-rose-600'
                          : cardTheme === 'white'
                          ? 'text-stone-600'
                          : 'text-amber-300'
                      }`}
                    >
                      {status.status === 'ok'
                        ? 'Up to date'
                        : status.status === 'advance'
                        ? `+${status.weeks_ahead}w ahead`
                        : `${formatCurrency(Math.abs(status.balance))} due`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Box */}
          <div
            className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border ${
              cardTheme === 'white'
                ? 'bg-emerald-50 border-emerald-200 text-stone-900'
                : 'bg-black/40 border-emerald-700 text-white'
            }`}
          >
            <div>
              <div
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  cardTheme === 'white' ? 'text-emerald-800' : 'text-stone-400'
                }`}
              >
                Week {selectedWeek} Collected
              </div>
              <div
                className={`text-lg font-black mt-0.5 ${
                  cardTheme === 'white' ? 'text-emerald-900' : 'text-amber-300'
                }`}
              >
                {formatCurrency(weekCollectedTotal)}
              </div>
              <div
                className={`text-[10px] ${
                  cardTheme === 'white' ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                Target: Rs. 6,000
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  cardTheme === 'white' ? 'text-emerald-800' : 'text-stone-400'
                }`}
              >
                Total Fund Collected
              </div>
              <div
                className={`text-lg font-black mt-0.5 ${
                  cardTheme === 'white' ? 'text-emerald-900' : 'text-emerald-400'
                }`}
              >
                {formatCurrency(grandTotalCollected)}
              </div>
              <div
                className={`text-[10px] ${
                  cardTheme === 'white' ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                Target: {formatCurrency(settings.target_amount)}
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div
            className={`mt-3 p-2.5 rounded-xl border text-center text-xs ${
              cardTheme === 'white'
                ? 'bg-stone-50 border-stone-200 text-stone-700'
                : 'bg-emerald-900/40 border-emerald-800 text-stone-200'
            }`}
          >
            <strong>Bank:</strong> {settings.bank_details.bank_name} · A/C {settings.bank_details.account_number} ({settings.bank_details.account_name})
          </div>

          {/* Footer */}
          <div
            className={`mt-3 pt-2.5 border-t text-center text-[11px] font-semibold ${
              cardTheme === 'white'
                ? 'border-stone-200 text-stone-500'
                : 'border-emerald-800 text-stone-300'
            }`}
          >
            {settings.footer_text}
          </div>
        </div>
      </div>

      {/* ================= DEDICATED WHATSAPP TEXT PREVIEW & COPY BOX ================= */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              WhatsApp Message Text (Ready to Send)
            </h2>
          </div>
          <button
            onClick={handleCopyWhatsAppText}
            className="text-xs px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all flex items-center gap-1"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Clean, fully white readable text preview */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto select-all">
          {whatsappMessageText}
        </div>
      </div>

      {/* Overall Summary PNG Modal */}
      <SummaryPngModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        defaultMode="overall"
      />
    </div>
  );
}
