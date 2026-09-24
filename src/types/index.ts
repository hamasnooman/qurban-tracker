export type UserRole = 'main_admin' | 'sub_admin' | 'family';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  family_id?: string | null;
}

export type PaymentMethod = 'Cash' | 'BOC' | 'Commercial Bank' | 'Amana Bank' | 'Other';

export interface Family {
  id: string;
  name: string; // e.g. "Mr. Nooman"
  family_title: string; // e.g. "Nooman Family"
  husband_name: string;
  wife_name: string;
  husband_phone: string;
  wife_phone: string;
  sort_order: number;
}

export interface Payment {
  id: string;
  family_id: string;
  amount: number;
  paid_by: string; // Husband name or Wife name or "Imported"
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  reference_number?: string;
  note?: string;
  entered_by: string;
  created_at: string;
  updated_at?: string;
}

export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string;
}

export interface BankDetails {
  account_name: string;
  bank_name: string;
  account_number: string;
  branch: string;
}

export interface AppSettings {
  fund_name: string;
  weekly_amount: number; // Rs. 1,500
  total_weeks: number; // 51
  start_date: string; // 2026-05-29
  eid_date: string; // 2027-05-16
  target_amount: number; // Rs. 306,000
  currency_symbol: string; // Rs.
  timezone: string; // Asia/Colombo
  footer_text: string; // "Jazakallahu Khairan 🤲 · #QurbanFamily2027"
  bank_details: BankDetails;
  bank_accounts?: BankAccount[];
  sms_enabled: boolean;
  sms_template_due: string;
  sms_template_paid: string;
}

export type FamilyBalanceStatus = 'advance' | 'ok' | 'due';

export interface FamilyFinancialStatus {
  family_id: string;
  family_name: string;
  total_paid: number;
  weeks_due: number;
  expected_amount: number;
  balance: number; // positive = advance, 0 = up to date, negative = due
  status: FamilyBalanceStatus;
  status_label: string; // e.g. "2 weeks ahead", "Up to date", "Rs. 3,000 due · 2 weeks behind"
  weeks_behind: number;
  weeks_ahead: number;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  last_paid_by: string | null;
}

export type WeekCellStatus = 'paid' | 'part' | 'unpaid' | 'advance';

export interface WeekGridCell {
  family_id: string;
  status: WeekCellStatus;
  allocated_amount: number; // 0 to 1500
  target_amount: number; // 1500
  label: string; // "Paid", "Part (Rs. 500)", "Not paid", "Advance"
}

export interface WeekGridRow {
  week_number: number;
  week_date: string; // YYYY-MM-DD
  formatted_date: string; // "29 May 2026"
  is_past_or_current: boolean;
  family_cells: Record<string, WeekGridCell>;
  row_total: number;
  row_target: number;
}

export interface SMSLog {
  id: string;
  family_id: string;
  family_name: string;
  recipient_name: string;
  phone_number: string;
  message: string;
  status: 'sent' | 'failed' | 'simulated';
  week_number: number;
  sent_at: string;
  error_message?: string;
}
