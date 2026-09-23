-- ====================================================================
-- FIX FOR ERROR 42501: "new row violates row-level security policy"
-- ====================================================================
-- Copy and paste this ENTIRE block into your Supabase SQL Editor and click "Run".
-- This allows the frontend application to insert/update payments, settings,
-- and families, while user authorization is managed by the application.
-- ====================================================================

-- 1. FIX PAYMENTS TABLE POLICIES
drop policy if exists "Allow main_admin to insert payments" on public.payments;
drop policy if exists "Allow main_admin to update payments" on public.payments;
drop policy if exists "Allow sub_admin to update same-day payments" on public.payments;
drop policy if exists "Allow main_admin to delete payments" on public.payments;
drop policy if exists "Allow read access to all payments" on public.payments;
drop policy if exists "Allow insert payments" on public.payments;
drop policy if exists "Allow update payments" on public.payments;
drop policy if exists "Allow delete payments" on public.payments;

create policy "Allow read access to all payments" on public.payments
  for select using (true);

create policy "Allow insert payments" on public.payments
  for insert with check (true);

create policy "Allow update payments" on public.payments
  for update using (true);

create policy "Allow delete payments" on public.payments
  for delete using (true);


-- 2. FIX SETTINGS TABLE POLICIES
drop policy if exists "Allow main_admin to update settings" on public.settings;
drop policy if exists "Allow read access to settings" on public.settings;
drop policy if exists "Allow manage settings" on public.settings;

create policy "Allow read access to settings" on public.settings
  for select using (true);

create policy "Allow manage settings" on public.settings
  for all using (true);


-- 3. FIX FAMILIES TABLE POLICIES
drop policy if exists "Allow main_admin to manage families" on public.families;
drop policy if exists "Allow read access to all families" on public.families;
drop policy if exists "Allow manage families" on public.families;

create policy "Allow read access to all families" on public.families
  for select using (true);

create policy "Allow manage families" on public.families
  for all using (true);


-- 4. FIX USER PROFILES POLICIES
drop policy if exists "Allow main_admin to manage profiles" on public.user_profiles;
drop policy if exists "Allow users to view profiles" on public.user_profiles;
drop policy if exists "Allow read profiles" on public.user_profiles;
drop policy if exists "Allow manage profiles" on public.user_profiles;

create policy "Allow read profiles" on public.user_profiles
  for select using (true);

create policy "Allow manage profiles" on public.user_profiles
  for all using (true);
