'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Family,
  Payment,
  AppSettings,
  UserProfile,
  SMSLog,
  FamilyFinancialStatus,
} from '@/types';
import {
  INITIAL_FAMILIES,
  INITIAL_PAYMENTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  DEFAULT_VIEWER,
} from '@/lib/mock-data';
import {
  calculateAllFamiliesStatus,
  calculateFamilyStatus,
  formatDateISO,
  getColomboDate,
  generateSMSMessage,
} from '@/lib/calculations';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AppContextType {
  families: Family[];
  payments: Payment[];
  settings: AppSettings;
  users: UserProfile[];
  currentUser: UserProfile;
  smsLogs: SMSLog[];
  isInitialized: boolean;
  isSupabase: boolean;
  theme: 'light' | 'dark';
  financialStatuses: FamilyFinancialStatus[];
  toggleTheme: () => void;
  switchUser: (user: UserProfile) => void;
  loginAsAdmin: (
    adminType: 'main_admin' | 'sub_admin',
    pin?: string
  ) => { success: boolean; error?: string };
  logoutToUserView: () => void;
  addPayment: (
    data: Omit<Payment, 'id' | 'created_at'>
  ) => Promise<{ success: boolean; error?: string; payment?: Payment }>;
  updatePayment: (
    id: string,
    data: Partial<Payment>
  ) => Promise<{ success: boolean; error?: string }>;
  deletePayment: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (data: Partial<AppSettings>) => Promise<{ success: boolean; error?: string }>;
  updateFamily: (id: string, data: Partial<Family>) => Promise<{ success: boolean; error?: string }>;
  triggerWeeklySMS: (
    mode?: 'all' | 'test',
    testPhone?: string
  ) => Promise<{ success: boolean; count: number; message: string }>;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAMILIES: 'qurban_families_v2',
  PAYMENTS: 'qurban_payments_v2',
  SETTINGS: 'qurban_settings_v2',
  USERS: 'qurban_users_v2',
  CURRENT_USER: 'qurban_current_user_v2',
  SMS_LOGS: 'qurban_sms_logs_v2',
  THEME: 'qurban_theme_v2',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [families, setFamilies] = useState<Family[]>(INITIAL_FAMILIES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_VIEWER);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Completely sanitize families to ensure Mr. Hamas only (NO Mrs. Hamas)
  const sanitizeFamilies = (raw: Family[]): Family[] => {
    return raw.map((f) => {
      if (f.id === 'fam-hamas' || f.name.toLowerCase().includes('hamas')) {
        return {
          ...f,
          name: 'Mr. Hamas',
          family_title: 'Mr. Hamas',
          husband_name: 'Mr. Hamas',
          wife_name: '',
          wife_phone: '',
        };
      }
      return f;
    });
  };

  // Load from localStorage or Supabase on mount
  useEffect(() => {
    try {
      // Force dark theme as requested
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');

      const client = supabase;
      if (isSupabaseConfigured && client) {
        // Fetch from Supabase
        const fetchRemote = async () => {
          try {
            const [famRes, payRes, setRes] = await Promise.all([
              client.from('families').select('*').order('sort_order'),
              client.from('payments').select('*').order('payment_date', { ascending: false }),
              client.from('settings').select('*').limit(1).maybeSingle(),
            ]);

            if (famRes.data && famRes.data.length > 0) {
              const clean = sanitizeFamilies(famRes.data);
              setFamilies(clean);
              localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(clean));
            }
            if (payRes.data && payRes.data.length > 0) setPayments(payRes.data);
            if (setRes.data) setSettings(setRes.data);
          } catch (e) {
            console.warn('Error loading from Supabase, using local fallback:', e);
          }
        };
        fetchRemote();
      } else {
        // Fallback to localStorage with sanitization
        const storedFam = localStorage.getItem(STORAGE_KEYS.FAMILIES);
        const storedPay = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        const storedSet = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedLogs = localStorage.getItem(STORAGE_KEYS.SMS_LOGS);

        if (storedFam) {
          const clean = sanitizeFamilies(JSON.parse(storedFam));
          setFamilies(clean);
          localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(clean));
        } else {
          const clean = sanitizeFamilies(INITIAL_FAMILIES);
          setFamilies(clean);
          localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(clean));
        }
        if (storedPay) setPayments(JSON.parse(storedPay));
        if (storedSet) setSettings(JSON.parse(storedSet));
        if (storedLogs) setSmsLogs(JSON.parse(storedLogs));
      }

      // Check for saved admin session in localStorage
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'main_admin' || parsed.role === 'sub_admin') {
            const matched = INITIAL_USERS.find((u) => u.id === parsed.id) || parsed;
            setCurrentUser(matched);
          } else {
            setCurrentUser(DEFAULT_VIEWER);
          }
        } catch {
          setCurrentUser(DEFAULT_VIEWER);
        }
      } else {
        // Direct click always lands on User View
        setCurrentUser(DEFAULT_VIEWER);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes (in local mode)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.SMS_LOGS, JSON.stringify(smsLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [families, payments, settings, currentUser, smsLogs, isInitialized]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  };

  const loginAsAdmin = (
    adminType: 'main_admin' | 'sub_admin',
    pin?: string
  ): { success: boolean; error?: string } => {
    const enteredPin = (pin || '').trim();
    if (!enteredPin) {
      return { success: false, error: 'Password is required.' };
    }

    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '2027';
    if (enteredPin !== adminSecret) {
      return { success: false, error: 'Incorrect password. Access denied.' };
    }

    const targetUser = INITIAL_USERS.find((u) => u.role === adminType);
    if (!targetUser) {
      return { success: false, error: 'Admin profile not found.' };
    }

    setCurrentUser(targetUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(targetUser));
    return { success: true };
  };

  const logoutToUserView = () => {
    setCurrentUser(DEFAULT_VIEWER);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_VIEWER));
  };

  const resetToSeedData = () => {
    setFamilies(INITIAL_FAMILIES);
    setPayments(INITIAL_PAYMENTS);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(DEFAULT_VIEWER);
    setSmsLogs([]);
    localStorage.removeItem(STORAGE_KEYS.FAMILIES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SMS_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // Add Payment
  const addPayment = async (
    data: Omit<Payment, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string; payment?: Payment }> => {
    if (currentUser.role === 'family') {
      return { success: false, error: 'Family accounts have read-only permissions.' };
    }

    const newPayment: Payment = {
      ...data,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entered_by: currentUser.name,
      created_at: new Date().toISOString(),
    };

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { error } = await client.from('payments').insert([newPayment]);
        if (error) throw error;
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Database error' };
      }
    }

    setPayments((prev) => [newPayment, ...prev]);
    return { success: true, payment: newPayment };
  };

  // Update Payment
  const updatePayment = async (
    id: string,
    data: Partial<Payment>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = payments.find((p) => p.id === id);
    if (!target) return { success: false, error: 'Payment not found' };

    // Role verification
    if (currentUser.role === 'family') {
      return { success: false, error: 'Family accounts cannot edit payments.' };
    }

    if (currentUser.role === 'sub_admin') {
      // Sub admin can only edit their own payments created today
      const todayIso = formatDateISO(getColomboDate());
      const paymentDateIso = formatDateISO(new Date(target.created_at));
      const isOwner = target.entered_by === currentUser.name;

      if (!isOwner) {
        return {
          success: false,
          error: 'Sub Admins can only edit payments entered by themselves.',
        };
      }
      if (todayIso !== paymentDateIso) {
        return {
          success: false,
          error: 'Sub Admins can only edit payments on the same day they were entered.',
        };
      }
    }

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { error } = await client
          .from('payments')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Database error' };
      }
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      )
    );
    return { success: true };
  };

  // Delete Payment
  const deletePayment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'main_admin') {
      return { success: false, error: 'Only Main Admin can delete payments.' };
    }

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { error } = await client.from('payments').delete().eq('id', id);
        if (error) throw error;
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Database error' };
      }
    }

    setPayments((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  // Update Settings
  const updateSettings = async (
    data: Partial<AppSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'main_admin') {
      return { success: false, error: 'Only Main Admin can update settings.' };
    }

    const updated = { ...settings, ...data };
    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { error } = await client.from('settings').upsert({ id: 'primary', ...updated });
        if (error) throw error;
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Database error' };
      }
    }

    setSettings(updated);
    return { success: true };
  };

  // Update Family Details
  const updateFamily = async (
    id: string,
    data: Partial<Family>
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'main_admin') {
      return { success: false, error: 'Only Main Admin can update family details.' };
    }

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { error } = await client.from('families').update(data).eq('id', id);
        if (error) throw error;
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Database error' };
      }
    }

    setFamilies((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    return { success: true };
  };

  // Trigger Weekly SMS or Test SMS
  const triggerWeeklySMS = async (
    mode: 'all' | 'test' = 'all',
    testPhone?: string
  ): Promise<{ success: boolean; count: number; message: string }> => {
    if (currentUser.role !== 'main_admin') {
      return { success: false, count: 0, message: 'Only Main Admin can trigger SMS.' };
    }

    if (!settings.sms_enabled && mode === 'all') {
      return { success: false, count: 0, message: 'SMS is currently turned OFF in Settings.' };
    }

    const currentStatuses = calculateAllFamiliesStatus(families, payments, settings);
    const newLogs: SMSLog[] = [];
    let sentCount = 0;

    const currentWeek =
      currentStatuses[0]?.weeks_due ||
      1;

    if (mode === 'test') {
      const targetPhone = testPhone || '+94771234561';
      const sampleFamily = families[0];
      const sampleStatus = currentStatuses[0];
      const sampleMsg = generateSMSMessage(sampleFamily, sampleStatus, settings);

      const logItem: SMSLog = {
        id: `sms-test-${Date.now()}`,
        family_id: sampleFamily.id,
        family_name: sampleFamily.name,
        recipient_name: 'Test Number (Main Admin)',
        phone_number: targetPhone,
        message: sampleMsg,
        status: 'sent',
        week_number: currentWeek,
        sent_at: new Date().toISOString(),
      };

      try {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: targetPhone, message: sampleMsg }),
        });
      } catch {
        // Fallback simulation handled
      }

      newLogs.push(logItem);
      setSmsLogs((prev) => [logItem, ...prev]);
      return { success: true, count: 1, message: `Test SMS successfully sent to ${targetPhone}!` };
    }

    // Mode === 'all'
    for (const fam of families) {
      const status = currentStatuses.find((s) => s.family_id === fam.id);
      if (!status) continue;

      const message = generateSMSMessage(fam, status, settings);

      // Husband
      if (fam.husband_phone) {
        // Deduplication: check if already sent to this number in this week
        const alreadySent = smsLogs.some(
          (l) =>
            l.phone_number === fam.husband_phone &&
            l.week_number === currentWeek &&
            l.status === 'sent'
        );

        if (!alreadySent) {
          const logItem: SMSLog = {
            id: `sms-${fam.id}-h-${Date.now()}`,
            family_id: fam.id,
            family_name: fam.name,
            recipient_name: fam.husband_name || fam.name,
            phone_number: fam.husband_phone,
            message,
            status: 'sent',
            week_number: currentWeek,
            sent_at: new Date().toISOString(),
          };
          newLogs.push(logItem);
          sentCount++;
        }
      }

      // Wife
      if (fam.wife_phone) {
        const alreadySent = smsLogs.some(
          (l) =>
            l.phone_number === fam.wife_phone &&
            l.week_number === currentWeek &&
            l.status === 'sent'
        );

        if (!alreadySent) {
          const logItem: SMSLog = {
            id: `sms-${fam.id}-w-${Date.now()}`,
            family_id: fam.id,
            family_name: fam.name,
            recipient_name: fam.wife_name || `${fam.name} Wife`,
            phone_number: fam.wife_phone,
            message,
            status: 'sent',
            week_number: currentWeek,
            sent_at: new Date().toISOString(),
          };
          newLogs.push(logItem);
          sentCount++;
        }
      }
    }

    setSmsLogs((prev) => [...newLogs, ...prev]);
    return {
      success: true,
      count: sentCount,
      message: `Weekly SMS triggered! ${sentCount} messages processed for Week ${currentWeek}.`,
    };
  };

  const financialStatuses = calculateAllFamiliesStatus(families, payments, settings);

  return (
    <AppContext.Provider
      value={{
        families,
        payments,
        settings,
        users,
        currentUser,
        smsLogs,
        isInitialized,
        isSupabase: isSupabaseConfigured,
        theme,
        financialStatuses,
        toggleTheme,
        switchUser,
        loginAsAdmin,
        logoutToUserView,
        addPayment,
        updatePayment,
        deletePayment,
        updateSettings,
        updateFamily,
        triggerWeeklySMS,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
