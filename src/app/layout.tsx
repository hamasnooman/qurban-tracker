import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Qurban Family Savings Tracker 2026/27',
  description:
    'Manage 4-family Qurban savings fund for Eid al-Adha 2027. Weekly tracker, live balance calculations, and WhatsApp card sharing.',
  keywords: ['Qurban', 'Savings', 'Eid al-Adha', 'Sri Lanka', 'Family Fund'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row antialiased">
        <AppProvider>
          {/* Navigation handles desktop sidebar + mobile headers/bottom bar */}
          <Navigation />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>

            {/* Global Footer */}
            <footer className="mt-auto py-6 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center justify-center gap-2 font-medium">
                <span>Jazakallahu Khairan 🤲</span>
                <span>·</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  #QurbanFamily2027
                </span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                4 Families · Rs. 1,500/week · Target Rs. 306,000 for Eid al-Adha 2027
              </p>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
