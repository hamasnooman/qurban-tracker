'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  formatCurrency,
  formatDisplayDate,
  getWeeksDue,
} from '@/lib/calculations';
import { toPng, toBlob } from 'html-to-image';
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon,
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
}: SummaryPngModalProps) {
  const { settings, financialStatuses } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);
  const [theme, setTheme] = useState<'emerald' | 'white'>('emerald');

  // Interaction feedback states
  const [isDownloading, setIsDownloading] = useState(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState(false);
  const [copyTextSuccess, setCopyTextSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Aggregate calculations for the 4 persons
  const totalCollected = financialStatuses.reduce((acc, s) => acc + s.total_paid, 0);
  const totalDue = financialStatuses
    .filter((s) => s.balance < 0)
    .reduce((sum, s) => sum + Math.abs(s.balance), 0);

  const todayFormatted = formatDisplayDate(new Date().toISOString().slice(0, 10));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Image export options
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
      link.download = `Qurban_4_Persons_Summary_Week_${currentWeek}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✓ PNG downloaded successfully! Ready to share on WhatsApp.');
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
        showToast('✓ Image copied! Paste directly into WhatsApp (Ctrl+V).');
        setTimeout(() => setCopyImageSuccess(false), 3000);
      } else {
        handleDownloadPng();
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      handleDownloadPng();
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Web Share API (Direct to WhatsApp / Apps on Mobile)
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await toBlob(cardRef.current, getImageOptions());
      if (blob) {
        const file = new File([blob], `Qurban_Summary_Week_${currentWeek}.png`, {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${settings.fund_name} - Summary`,
            text: `🌙 Qurban Family Savings Summary - Week ${currentWeek}`,
          });
          setShareSuccess(true);
          showToast('✓ Shared successfully!');
          setTimeout(() => setShareSuccess(false), 3000);
        } else {
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

  // 4. Copy WhatsApp Text
  const handleCopyWhatsappText = () => {
    const text = `🌙 *${settings.fund_name}*
📅 *4-Person Summary · Week ${currentWeek} of ${settings.total_weeks}* (${todayFormatted})
━━━━━━━━━━━━━━━━━━━━

${financialStatuses
  .map((s, idx) => {
    const dueText =
      s.balance < 0
        ? `⚠️ Due: ${formatCurrency(Math.abs(s.balance))} (${s.weeks_behind}w behind)`
        : s.balance > 0
        ? `🌟 Advance: +${formatCurrency(s.balance)} (${s.weeks_ahead}w ahead)`
        : `✅ Up to date (Rs. 0 Due)`;

    return `${idx + 1}️⃣ *${s.family_name}*
   • Total Paid: ${formatCurrency(s.total_paid)}
   • Status: ${dueText}`;
  })
  .join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
💰 *Total Fund Collected:* ${formatCurrency(totalCollected)}
${totalDue > 0 ? `⚠️ *Total Amount Due:* ${formatCurrency(totalDue)}\n` : '✅ *All accounts up to date!*\n'}
🏦 *Bank Accounts for Transfer:*
• Commercial Bank: 8016292617 (M N Hamas)
• Amana Bank: 0110578227001 (MN Hamas)
• BOC: 96503121 (MN Hamas)

_Please send payment slips on WhatsApp._
Jazakallahu Khairan 🤲 · #QurbanFamily2027`;

    navigator.clipboard.writeText(text);
    setCopyTextSuccess(true);
    showToast('✓ WhatsApp text copied to clipboard!');
    setTimeout(() => setCopyTextSuccess(false), 2500);
  };

  const isEmerald = theme === 'emerald';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f141f] rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* ================= MODAL TOP BAR ================= */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-amber-300 flex items-center justify-center shadow-xs text-base">
              🌙
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>4-Person Summary Image</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Ready to Share
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Shows each person&apos;s Total Paid, Due amount, and overall totals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Theme Bar */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Card Theme:
          </span>

          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setTheme('emerald')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                theme === 'white'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>📄</span>
              <span>Clean White</span>
            </button>
          </div>
        </div>

        {/* ================= SCROLLABLE PREVIEW AREA ================= */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex justify-center bg-slate-200/50 dark:bg-black/40">
          
          {/* ================= THE FOCUSED 4-PERSON SUMMARY CARD ================= */}
          <div
            ref={cardRef}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: isEmerald ? '#042f2e' : '#ffffff',
              color: isEmerald ? '#ffffff' : '#0f172a',
            }}
            className={`rounded-3xl p-5 sm:p-6 shadow-xl border transition-all space-y-4 ${
              isEmerald ? 'border-emerald-700' : 'border-slate-300'
            }`}
          >
            {/* 1. Header */}
            <div
              className={`pb-3 border-b flex items-center justify-between gap-3 ${
                isEmerald ? 'border-emerald-800/80' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                    isEmerald
                      ? 'bg-emerald-800/90 text-amber-300 border border-emerald-600/50'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  🌙
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                    {settings.fund_name}
                  </h2>
                  <p
                    className={`text-[11px] font-medium ${
                      isEmerald ? 'text-emerald-300/90' : 'text-slate-500'
                    }`}
                  >
                    4-Person Contribution Summary
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                    isEmerald
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  WEEK {currentWeek} OF {settings.total_weeks}
                </span>
                <div
                  className={`text-[10px] font-mono mt-0.5 ${
                    isEmerald ? 'text-emerald-300/80' : 'text-slate-500'
                  }`}
                >
                  {todayFormatted}
                </div>
              </div>
            </div>

            {/* 2. The 4 Persons Summary Table / Cards */}
            <div className="space-y-2">
              <div
                className={`text-[10px] font-bold uppercase tracking-wider grid grid-cols-12 px-2 pb-1 ${
                  isEmerald ? 'text-emerald-300/80' : 'text-slate-500'
                }`}
              >
                <span className="col-span-5">Person / Family</span>
                <span className="col-span-3 text-right">Total Paid</span>
                <span className="col-span-4 text-right">Status / Due</span>
              </div>

              {financialStatuses.map((s, idx) => {
                const isDue = s.status === 'due';
                const isAdvance = s.status === 'advance';

                return (
                  <div
                    key={s.family_id}
                    className={`grid grid-cols-12 items-center p-3 rounded-2xl border transition-colors ${
                      isEmerald
                        ? 'bg-emerald-900/40 border-emerald-800/90'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Person Name */}
                    <div className="col-span-5 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isEmerald
                              ? 'bg-emerald-800 text-amber-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div
                          className={`font-black text-sm tracking-tight truncate ${
                            isEmerald ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {s.family_name}
                        </div>
                      </div>
                      <div
                        className={`text-[10px] pl-6.5 font-medium ${
                          isEmerald ? 'text-emerald-300/70' : 'text-slate-500'
                        }`}
                      >
                        Rs. 1,500 / week
                      </div>
                    </div>

                    {/* Total Paid */}
                    <div className="col-span-3 text-right pr-1">
                      <div
                        className={`font-black text-sm ${
                          isEmerald ? 'text-amber-300' : 'text-emerald-700'
                        }`}
                      >
                        {formatCurrency(s.total_paid)}
                      </div>
                      <div
                        className={`text-[9px] font-mono ${
                          isEmerald ? 'text-emerald-300/70' : 'text-slate-500'
                        }`}
                      >
                        {(s.total_paid / 1500).toFixed(0)} of {settings.total_weeks} wks
                      </div>
                    </div>

                    {/* Due / Balance Status */}
                    <div className="col-span-4 text-right">
                      {isDue ? (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <span>⚠️</span>
                            <span>{formatCurrency(Math.abs(s.balance))} Due</span>
                          </span>
                          <div className="text-[9px] font-semibold text-rose-500 mt-0.5">
                            {s.weeks_behind} {s.weeks_behind === 1 ? 'week' : 'weeks'} behind
                          </div>
                        </div>
                      ) : isAdvance ? (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            <span>🌟</span>
                            <span>+{formatCurrency(s.balance)}</span>
                          </span>
                          <div className="text-[9px] font-semibold text-amber-500 mt-0.5">
                            {s.weeks_ahead}w ahead (Adv)
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black ${
                              isEmerald
                                ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            <span>✅</span>
                            <span>Up to date</span>
                          </span>
                          <div
                            className={`text-[9px] font-medium mt-0.5 ${
                              isEmerald ? 'text-emerald-300/80' : 'text-slate-500'
                            }`}
                          >
                            Rs. 0 Due
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Total Row */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isEmerald
                  ? 'bg-emerald-950 border-emerald-800 text-white'
                  : 'bg-emerald-50/80 border-emerald-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isEmerald ? 'text-emerald-300' : 'text-emerald-900'
                    }`}
                  >
                    Total Fund Collected (4 Persons)
                  </div>
                  <div
                    className={`text-xl font-black mt-0.5 ${
                      isEmerald ? 'text-amber-300' : 'text-emerald-800'
                    }`}
                  >
                    {formatCurrency(totalCollected)}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      totalDue > 0
                        ? 'text-rose-500'
                        : isEmerald
                        ? 'text-emerald-300'
                        : 'text-emerald-900'
                    }`}
                  >
                    {totalDue > 0 ? 'Total Outstanding Due' : 'Overall Status'}
                  </div>
                  <div
                    className={`text-base font-black mt-0.5 ${
                      totalDue > 0
                        ? 'text-rose-400'
                        : isEmerald
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                    }`}
                  >
                    {totalDue > 0 ? `${formatCurrency(totalDue)} Due` : '✅ All Up to Date'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Compact Bank Transfer Info */}
            <div
              className={`p-2.5 rounded-xl border text-[10px] space-y-1 ${
                isEmerald
                  ? 'bg-emerald-900/30 border-emerald-800 text-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>🏦 Bank Accounts for Contributions (Rs. 1,500/wk):</span>
                <span className="opacity-75">A/C: M N Hamas</span>
              </div>
              <div className="font-mono text-[9px] flex flex-wrap gap-x-3 gap-y-0.5 opacity-90">
                <span>• Comm Bank: <strong>8016292617</strong></span>
                <span>• Amana Bank: <strong>0110578227001</strong></span>
                <span>• BOC: <strong>96503121</strong></span>
              </div>
            </div>

            {/* 5. Footer */}
            <div
              className={`pt-2 border-t flex items-center justify-between text-[9px] font-medium ${
                isEmerald
                  ? 'border-emerald-800/80 text-emerald-300/80'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              <div>Please share bank transfer slip on WhatsApp</div>
              <div className="font-mono">#QurbanFamily2027 · Eid 2027 🤲</div>
            </div>
          </div>
        </div>

        {/* ================= MODAL BOTTOM ACTION BAR ================= */}
        <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">High-DPI PNG</span> · Crisp for WhatsApp
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
            </button>

            {/* Copy Image Button */}
            <button
              onClick={handleCopyImage}
              disabled={isDownloading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Copy image to clipboard (paste directly into WhatsApp with Ctrl+V)"
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

            {/* Share Image Button */}
            <button
              onClick={handleShareImage}
              disabled={isDownloading}
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Share image via WhatsApp / apps"
            >
              {shareSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Shared!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* WhatsApp Text Copy */}
            <button
              onClick={handleCopyWhatsappText}
              className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted WhatsApp text"
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
