import { Family, Payment, AppSettings, UserProfile } from '@/types';

export const INITIAL_FAMILIES: Family[] = [
  {
    id: 'fam-nooman',
    name: 'Mr. Nooman',
    family_title: 'Nooman Family',
    husband_name: 'Nooman',
    wife_name: 'Mrs. Nooman',
    husband_phone: '+94771234561',
    wife_phone: '+94771234562',
    sort_order: 1,
  },
  {
    id: 'fam-rikaz',
    name: 'Mr. Rikaz',
    family_title: 'Rikaz Family',
    husband_name: 'Rikaz',
    wife_name: 'Mrs. Rikaz',
    husband_phone: '+94772345671',
    wife_phone: '+94772345672',
    sort_order: 2,
  },
  {
    id: 'fam-haneef',
    name: 'Mr. Haneef',
    family_title: 'Haneef Family',
    husband_name: 'Haneef',
    wife_name: 'Mrs. Haneef',
    husband_phone: '+94773456781',
    wife_phone: '+94773456782',
    sort_order: 3,
  },
  {
    id: 'fam-hamas',
    name: 'Mr. Hamas',
    family_title: 'Mr. Hamas',
    husband_name: 'Mr. Hamas',
    wife_name: '',
    husband_phone: '+94774567891',
    wife_phone: '',
    sort_order: 4,
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  fund_name: 'Qurban Family Savings Tracker 2026/27',
  weekly_amount: 1500,
  total_weeks: 51,
  start_date: '2026-05-29',
  eid_date: '2027-05-16',
  target_amount: 306000,
  currency_symbol: 'Rs.',
  timezone: 'Asia/Colombo',
  footer_text: 'Jazakallahu Khairan 🤲 · #QurbanFamily2027',
  bank_details: {
    account_name: 'M. Nooman (Qurban Fund)',
    bank_name: 'Bank of Ceylon (BOC)',
    account_number: '8910234567',
    branch: 'Colombo Central',
  },
  sms_enabled: true,
  sms_template_due:
    'Assalamu Alaikum. Qurban Fund - {FAMILY}.\nPaid: {PAID}. Due now: {DUE}.\nPay to: {NAME}, {BANK}, A/C {ACCOUNT}. JazakAllah khair.',
  sms_template_paid:
    'Assalamu Alaikum. Qurban Fund - {FAMILY}.\nAlhamdulillah, your contributions are up to date! Total paid: {PAID}.\nMay Allah accept our Qurban. JazakAllah khair.',
};

export const DEFAULT_VIEWER: UserProfile = {
  id: 'user-public-viewer',
  email: 'viewer@qurban.local',
  name: 'Family View (Complete Review)',
  role: 'family',
  family_id: null,
};

export const INITIAL_USERS: UserProfile[] = [
  DEFAULT_VIEWER,
  {
    id: 'user-admin-hamas',
    email: 'hamas@qurban.local',
    name: 'Mr. Hamas (Main Admin)',
    role: 'main_admin',
    family_id: 'fam-hamas',
  },
  {
    id: 'user-subadmin-nihla',
    email: 'nihla@qurban.local',
    name: 'Nihla (Sub Admin)',
    role: 'sub_admin',
    family_id: null,
  },
  {
    id: 'user-family-nooman',
    email: 'nooman@qurban.local',
    name: 'Mr. Nooman (Family View)',
    role: 'family',
    family_id: 'fam-nooman',
  },
  {
    id: 'user-family-rikaz',
    email: 'rikaz@qurban.local',
    name: 'Mr. Rikaz (Family View)',
    role: 'family',
    family_id: 'fam-rikaz',
  },
  {
    id: 'user-family-haneef',
    email: 'haneef@qurban.local',
    name: 'Mr. Haneef (Family View)',
    role: 'family',
    family_id: 'fam-haneef',
  },
];

const weekDates = [
  { w: 1, date: '2026-05-29' },
  { w: 2, date: '2026-06-05' },
  { w: 3, date: '2026-06-12' },
  { w: 4, date: '2026-06-19' },
  { w: 5, date: '2026-06-26' },
  { w: 6, date: '2026-07-03' },
  { w: 7, date: '2026-07-10' },
  { w: 8, date: '2026-07-17' },
  { w: 9, date: '2026-07-24' },
  { w: 10, date: '2026-07-31' },
];

/**
 * Seed payments matching exact user specification:
 * - Mr. Nooman: Rs. 1,500 in each of W1–W10 (10 payments = 15,000)
 * - Mr. Rikaz: Rs. 1,500 in W1–W5; W6: Rs. 500 & Rs. 1,000; W7: Rs. 1,500; W8–W10: nothing (Total = 10,500)
 * - Mr. Haneef: Rs. 1,500 in W1; W2: Rs. 1,000 & Rs. 500; W3–W10: Rs. 1,500 each (Total = 15,000)
 * - Mr. Hamas: Rs. 1,500 in each of W1–W10 (10 payments = 15,000)
 * Total: 55,500
 */
export const INITIAL_PAYMENTS: Payment[] = [
  // Mr. Nooman (W1 - W10 @ 1,500)
  ...weekDates.map((w, idx) => ({
    id: `pay-nooman-${w.w}`,
    family_id: 'fam-nooman',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: w.date,
    payment_method: 'Other' as const,
    reference_number: `W${w.w}-IMPORT`,
    note: `Week ${w.w} contribution`,
    entered_by: 'Imported',
    created_at: `${w.date}T10:00:00Z`,
  })),

  // Mr. Rikaz (W1 - W5 @ 1,500)
  ...weekDates.slice(0, 5).map((w) => ({
    id: `pay-rikaz-${w.w}`,
    family_id: 'fam-rikaz',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: w.date,
    payment_method: 'Other' as const,
    reference_number: `W${w.w}-IMPORT`,
    note: `Week ${w.w} contribution`,
    entered_by: 'Imported',
    created_at: `${w.date}T10:00:00Z`,
  })),
  // Rikaz W6: two payments: Rs. 500 and Rs. 1,000
  {
    id: 'pay-rikaz-6a',
    family_id: 'fam-rikaz',
    amount: 500,
    paid_by: 'Not recorded',
    payment_date: '2026-07-03',
    payment_method: 'Other' as const,
    reference_number: 'W6-PART-1',
    note: 'Week 6 part payment (Rs. 500)',
    entered_by: 'Imported',
    created_at: '2026-07-03T10:00:00Z',
  },
  {
    id: 'pay-rikaz-6b',
    family_id: 'fam-rikaz',
    amount: 1000,
    paid_by: 'Not recorded',
    payment_date: '2026-07-03',
    payment_method: 'Other' as const,
    reference_number: 'W6-PART-2',
    note: 'Week 6 remaining payment (Rs. 1,000)',
    entered_by: 'Imported',
    created_at: '2026-07-03T14:00:00Z',
  },
  // Rikaz W7: Rs. 1,500
  {
    id: 'pay-rikaz-7',
    family_id: 'fam-rikaz',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: '2026-07-10',
    payment_method: 'Other' as const,
    reference_number: 'W7-IMPORT',
    note: 'Week 7 contribution',
    entered_by: 'Imported',
    created_at: '2026-07-10T10:00:00Z',
  },
  // Rikaz: nothing in W8 - W10

  // Mr. Haneef W1: Rs. 1,500
  {
    id: 'pay-haneef-1',
    family_id: 'fam-haneef',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: '2026-05-29',
    payment_method: 'Other' as const,
    reference_number: 'W1-IMPORT',
    note: 'Week 1 contribution',
    entered_by: 'Imported',
    created_at: '2026-05-29T10:00:00Z',
  },
  // Haneef W2: two payments: Rs. 1,000 and Rs. 500
  {
    id: 'pay-haneef-2a',
    family_id: 'fam-haneef',
    amount: 1000,
    paid_by: 'Not recorded',
    payment_date: '2026-06-05',
    payment_method: 'Other' as const,
    reference_number: 'W2-PART-1',
    note: 'Week 2 part payment (Rs. 1,000)',
    entered_by: 'Imported',
    created_at: '2026-06-05T10:00:00Z',
  },
  {
    id: 'pay-haneef-2b',
    family_id: 'fam-haneef',
    amount: 500,
    paid_by: 'Not recorded',
    payment_date: '2026-06-05',
    payment_method: 'Other' as const,
    reference_number: 'W2-PART-2',
    note: 'Week 2 balance payment (Rs. 500)',
    entered_by: 'Imported',
    created_at: '2026-06-05T15:00:00Z',
  },
  // Haneef W3 - W10: Rs. 1,500 each
  ...weekDates.slice(2, 10).map((w) => ({
    id: `pay-haneef-${w.w}`,
    family_id: 'fam-haneef',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: w.date,
    payment_method: 'Other' as const,
    reference_number: `W${w.w}-IMPORT`,
    note: `Week ${w.w} contribution`,
    entered_by: 'Imported',
    created_at: `${w.date}T10:00:00Z`,
  })),

  // Mr. Hamas (W1 - W10 @ 1,500)
  ...weekDates.map((w) => ({
    id: `pay-hamas-${w.w}`,
    family_id: 'fam-hamas',
    amount: 1500,
    paid_by: 'Not recorded',
    payment_date: w.date,
    payment_method: 'Other' as const,
    reference_number: `W${w.w}-IMPORT`,
    note: `Week ${w.w} contribution`,
    entered_by: 'Imported',
    created_at: `${w.date}T10:00:00Z`,
  })),
];
