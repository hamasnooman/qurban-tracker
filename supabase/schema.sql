-- =========================================================
-- Qurban Family Savings Tracker 2026/27 - Supabase Schema
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. FAMILIES TABLE
create table if not exists public.families (
  id text primary key,
  name text not null,
  family_title text not null,
  husband_name text,
  wife_name text,
  husband_phone text,
  wife_phone text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 2. SETTINGS TABLE
create table if not exists public.settings (
  id text primary key default 'primary',
  fund_name text not null default 'Qurban Family Savings Tracker 2026/27',
  weekly_amount numeric not null default 1500,
  total_weeks int not null default 51,
  start_date date not null default '2026-05-29',
  eid_date date not null default '2027-05-16',
  target_amount numeric not null default 306000,
  currency_symbol text not null default 'Rs.',
  timezone text not null default 'Asia/Colombo',
  footer_text text not null default 'Jazakallahu Khairan 🤲 · #QurbanFamily2027',
  bank_details jsonb not null default '{"account_name": "M. Nooman (Qurban Fund)", "bank_name": "Bank of Ceylon (BOC)", "account_number": "8910234567", "branch": "Colombo Central"}'::jsonb,
  sms_enabled boolean not null default true,
  sms_template_due text default 'Assalamu Alaikum. Qurban Fund - {FAMILY}.\nPaid: {PAID}. Due now: {DUE}.\nPay to: {NAME}, {BANK}, A/C {ACCOUNT}. JazakAllah khair.',
  sms_template_paid text default 'Assalamu Alaikum. Qurban Fund - {FAMILY}.\nAlhamdulillah, your contributions are up to date! Total paid: {PAID}.\nMay Allah accept our Qurban. JazakAllah khair.',
  updated_at timestamptz not null default now()
);

-- 3. PAYMENTS TABLE
create table if not exists public.payments (
  id text primary key default ('pay-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text),
  family_id text not null references public.families(id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_by text not null default 'Not recorded',
  payment_date date not null default current_date,
  payment_method text not null default 'Other',
  reference_number text,
  note text,
  entered_by text not null,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 4. SMS LOGS TABLE
create table if not exists public.sms_logs (
  id text primary key default ('sms-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text),
  family_id text references public.families(id) on delete set null,
  family_name text not null,
  recipient_name text not null,
  phone_number text not null,
  message text not null,
  status text not null default 'sent',
  week_number int not null,
  error_message text,
  sent_at timestamptz not null default now()
);

-- 5. USER PROFILES TABLE (linked to auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('main_admin', 'sub_admin', 'family')),
  family_id text references public.families(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes for lightning fast queries
create index if not exists idx_payments_family_id on public.payments(family_id);
create index if not exists idx_payments_payment_date on public.payments(payment_date);
create index if not exists idx_sms_logs_phone_week on public.sms_logs(phone_number, week_number);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
alter table public.families enable row level security;
alter table public.settings enable row level security;
alter table public.payments enable row level security;
alter table public.sms_logs enable row level security;
alter table public.user_profiles enable row level security;

-- FAMILIES POLICIES
create policy "Allow read access to all families" on public.families for select using (true);
create policy "Allow manage families" on public.families for all using (true);

-- SETTINGS POLICIES
create policy "Allow read access to settings" on public.settings for select using (true);
create policy "Allow manage settings" on public.settings for all using (true);

-- PAYMENTS POLICIES
create policy "Allow read access to all payments" on public.payments for select using (true);
create policy "Allow insert payments" on public.payments for insert with check (true);
create policy "Allow update payments" on public.payments for update using (true);
create policy "Allow delete payments" on public.payments for delete using (true);

-- SMS LOGS POLICIES
create policy "Allow read SMS logs" on public.sms_logs for select using (true);
create policy "Allow insert SMS logs" on public.sms_logs for insert with check (true);

-- USER PROFILES POLICIES
create policy "Allow read profiles" on public.user_profiles for select using (true);
create policy "Allow manage profiles" on public.user_profiles for all using (true);
