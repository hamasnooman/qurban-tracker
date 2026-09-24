-- =========================================================
-- Qurban Family Savings Tracker 2026/27 - Seed Data
-- =========================================================

-- 1. Insert Initial Settings
insert into public.settings (
  id,
  fund_name,
  weekly_amount,
  total_weeks,
  start_date,
  eid_date,
  target_amount,
  currency_symbol,
  timezone,
  footer_text,
  bank_details,
  sms_enabled
) values (
  'primary',
  'Qurban Family Savings Tracker 2026/27',
  1500,
  51,
  '2026-05-29',
  '2027-05-16',
  306000,
  'Rs.',
  'Asia/Colombo',
  'Jazakallahu Khairan 🤲 · #QurbanFamily2027',
  '{"account_name": "M. Nooman (Qurban Fund)", "bank_name": "Bank of Ceylon (BOC)", "account_number": "8910234567", "branch": "Colombo Central"}'::jsonb,
  true
) on conflict (id) do update set
  weekly_amount = excluded.weekly_amount,
  start_date = excluded.start_date,
  eid_date = excluded.eid_date,
  target_amount = excluded.target_amount;

-- 2. Insert The 4 Families
insert into public.families (id, name, family_title, husband_name, wife_name, husband_phone, wife_phone, sort_order)
values
  ('fam-nooman', 'Mr. Nooman', 'Nooman Family', 'Nooman', 'Mrs. Nooman', '+94771234561', '+94771234562', 1),
  ('fam-rikaz', 'Mr. Rikaz', 'Rikaz Family', 'Rikaz', 'Mrs. Rikaz', '+94772345671', '+94772345672', 2),
  ('fam-haneef', 'Mr. Haneef', 'Haneef Family', 'Haneef', 'Mrs. Haneef', '+94773456781', '+94773456782', 3),
  ('fam-hamas', 'Mr. Hamas', 'Mr. Hamas', 'Mr. Hamas', null, '+94774567891', null, 4)
on conflict (id) do update set
  name = excluded.name,
  family_title = excluded.family_title,
  sort_order = excluded.sort_order;

-- 3. Insert Payments (W1: 29 May 2026 to W10: 31 Jul 2026)
delete from public.payments where entered_by = 'Imported';

insert into public.payments (id, family_id, amount, paid_by, payment_date, payment_method, reference_number, note, entered_by, created_at)
values
  -- Mr. Nooman (10 payments of Rs. 1,500 = Rs. 15,000)
  ('pay-nooman-1',  'fam-nooman', 1500, 'Not recorded', '2026-05-29', 'Other', 'W1-IMPORT',  'Week 1 contribution',  'Imported', '2026-05-29 10:00:00+05:30'),
  ('pay-nooman-2',  'fam-nooman', 1500, 'Not recorded', '2026-06-05', 'Other', 'W2-IMPORT',  'Week 2 contribution',  'Imported', '2026-06-05 10:00:00+05:30'),
  ('pay-nooman-3',  'fam-nooman', 1500, 'Not recorded', '2026-06-12', 'Other', 'W3-IMPORT',  'Week 3 contribution',  'Imported', '2026-06-12 10:00:00+05:30'),
  ('pay-nooman-4',  'fam-nooman', 1500, 'Not recorded', '2026-06-19', 'Other', 'W4-IMPORT',  'Week 4 contribution',  'Imported', '2026-06-19 10:00:00+05:30'),
  ('pay-nooman-5',  'fam-nooman', 1500, 'Not recorded', '2026-06-26', 'Other', 'W5-IMPORT',  'Week 5 contribution',  'Imported', '2026-06-26 10:00:00+05:30'),
  ('pay-nooman-6',  'fam-nooman', 1500, 'Not recorded', '2026-07-03', 'Other', 'W6-IMPORT',  'Week 6 contribution',  'Imported', '2026-07-03 10:00:00+05:30'),
  ('pay-nooman-7',  'fam-nooman', 1500, 'Not recorded', '2026-07-10', 'Other', 'W7-IMPORT',  'Week 7 contribution',  'Imported', '2026-07-10 10:00:00+05:30'),
  ('pay-nooman-8',  'fam-nooman', 1500, 'Not recorded', '2026-07-17', 'Other', 'W8-IMPORT',  'Week 8 contribution',  'Imported', '2026-07-17 10:00:00+05:30'),
  ('pay-nooman-9',  'fam-nooman', 1500, 'Not recorded', '2026-07-24', 'Other', 'W9-IMPORT',  'Week 9 contribution',  'Imported', '2026-07-24 10:00:00+05:30'),
  ('pay-nooman-10', 'fam-nooman', 1500, 'Not recorded', '2026-07-31', 'Other', 'W10-IMPORT', 'Week 10 contribution', 'Imported', '2026-07-31 10:00:00+05:30'),

  -- Mr. Rikaz (W1-W5 @ 1500; W6 @ 500 + 1000; W7 @ 1500; Total = Rs. 10,500)
  ('pay-rikaz-1',  'fam-rikaz', 1500, 'Not recorded', '2026-05-29', 'Other', 'W1-IMPORT',   'Week 1 contribution',  'Imported', '2026-05-29 10:00:00+05:30'),
  ('pay-rikaz-2',  'fam-rikaz', 1500, 'Not recorded', '2026-06-05', 'Other', 'W2-IMPORT',   'Week 2 contribution',  'Imported', '2026-06-05 10:00:00+05:30'),
  ('pay-rikaz-3',  'fam-rikaz', 1500, 'Not recorded', '2026-06-12', 'Other', 'W3-IMPORT',   'Week 3 contribution',  'Imported', '2026-06-12 10:00:00+05:30'),
  ('pay-rikaz-4',  'fam-rikaz', 1500, 'Not recorded', '2026-06-19', 'Other', 'W4-IMPORT',   'Week 4 contribution',  'Imported', '2026-06-19 10:00:00+05:30'),
  ('pay-rikaz-5',  'fam-rikaz', 1500, 'Not recorded', '2026-06-26', 'Other', 'W5-IMPORT',   'Week 5 contribution',  'Imported', '2026-06-26 10:00:00+05:30'),
  ('pay-rikaz-6a', 'fam-rikaz', 500,  'Not recorded', '2026-07-03', 'Other', 'W6-PART-1',   'Week 6 part payment',  'Imported', '2026-07-03 10:00:00+05:30'),
  ('pay-rikaz-6b', 'fam-rikaz', 1000, 'Not recorded', '2026-07-03', 'Other', 'W6-PART-2',   'Week 6 part payment',  'Imported', '2026-07-03 14:00:00+05:30'),
  ('pay-rikaz-7',  'fam-rikaz', 1500, 'Not recorded', '2026-07-10', 'Other', 'W7-IMPORT',   'Week 7 contribution',  'Imported', '2026-07-10 10:00:00+05:30'),

  -- Mr. Haneef (W1 @ 1500; W2 @ 1000 + 500; W3-W10 @ 1500; Total = Rs. 15,000)
  ('pay-haneef-1',  'fam-haneef', 1500, 'Not recorded', '2026-05-29', 'Other', 'W1-IMPORT',  'Week 1 contribution',  'Imported', '2026-05-29 10:00:00+05:30'),
  ('pay-haneef-2a', 'fam-haneef', 1000, 'Not recorded', '2026-06-05', 'Other', 'W2-PART-1',  'Week 2 part payment',  'Imported', '2026-06-05 10:00:00+05:30'),
  ('pay-haneef-2b', 'fam-haneef', 500,  'Not recorded', '2026-06-05', 'Other', 'W2-PART-2',  'Week 2 part payment',  'Imported', '2026-06-05 14:00:00+05:30'),
  ('pay-haneef-3',  'fam-haneef', 1500, 'Not recorded', '2026-06-12', 'Other', 'W3-IMPORT',  'Week 3 contribution',  'Imported', '2026-06-12 10:00:00+05:30'),
  ('pay-haneef-4',  'fam-haneef', 1500, 'Not recorded', '2026-06-19', 'Other', 'W4-IMPORT',  'Week 4 contribution',  'Imported', '2026-06-19 10:00:00+05:30'),
  ('pay-haneef-5',  'fam-haneef', 1500, 'Not recorded', '2026-06-26', 'Other', 'W5-IMPORT',  'Week 5 contribution',  'Imported', '2026-06-26 10:00:00+05:30'),
  ('pay-haneef-6',  'fam-haneef', 1500, 'Not recorded', '2026-07-03', 'Other', 'W6-IMPORT',  'Week 6 contribution',  'Imported', '2026-07-03 10:00:00+05:30'),
  ('pay-haneef-7',  'fam-haneef', 1500, 'Not recorded', '2026-07-10', 'Other', 'W7-IMPORT',  'Week 7 contribution',  'Imported', '2026-07-10 10:00:00+05:30'),
  ('pay-haneef-8',  'fam-haneef', 1500, 'Not recorded', '2026-07-17', 'Other', 'W8-IMPORT',  'Week 8 contribution',  'Imported', '2026-07-17 10:00:00+05:30'),
  ('pay-haneef-9',  'fam-haneef', 1500, 'Not recorded', '2026-07-24', 'Other', 'W9-IMPORT',  'Week 9 contribution',  'Imported', '2026-07-24 10:00:00+05:30'),
  ('pay-haneef-10', 'fam-haneef', 1500, 'Not recorded', '2026-07-31', 'Other', 'W10-IMPORT', 'Week 10 contribution', 'Imported', '2026-07-31 10:00:00+05:30'),

  -- Mr. Hamas (10 payments of Rs. 1,500 = Rs. 15,000)
  ('pay-hamas-1',  'fam-hamas', 1500, 'Not recorded', '2026-05-29', 'Other', 'W1-IMPORT',  'Week 1 contribution',  'Imported', '2026-05-29 10:00:00+05:30'),
  ('pay-hamas-2',  'fam-hamas', 1500, 'Not recorded', '2026-06-05', 'Other', 'W2-IMPORT',  'Week 2 contribution',  'Imported', '2026-06-05 10:00:00+05:30'),
  ('pay-hamas-3',  'fam-hamas', 1500, 'Not recorded', '2026-06-12', 'Other', 'W3-IMPORT',  'Week 3 contribution',  'Imported', '2026-06-12 10:00:00+05:30'),
  ('pay-hamas-4',  'fam-hamas', 1500, 'Not recorded', '2026-06-19', 'Other', 'W4-IMPORT',  'Week 4 contribution',  'Imported', '2026-06-19 10:00:00+05:30'),
  ('pay-hamas-5',  'fam-hamas', 1500, 'Not recorded', '2026-06-26', 'Other', 'W5-IMPORT',  'Week 5 contribution',  'Imported', '2026-06-26 10:00:00+05:30'),
  ('pay-hamas-6',  'fam-hamas', 1500, 'Not recorded', '2026-07-03', 'Other', 'W6-IMPORT',  'Week 6 contribution',  'Imported', '2026-07-03 10:00:00+05:30'),
  ('pay-hamas-7',  'fam-hamas', 1500, 'Not recorded', '2026-07-10', 'Other', 'W7-IMPORT',  'Week 7 contribution',  'Imported', '2026-07-10 10:00:00+05:30'),
  ('pay-hamas-8',  'fam-hamas', 1500, 'Not recorded', '2026-07-17', 'Other', 'W8-IMPORT',  'Week 8 contribution',  'Imported', '2026-07-17 10:00:00+05:30'),
  ('pay-hamas-9',  'fam-hamas', 1500, 'Not recorded', '2026-07-24', 'Other', 'W9-IMPORT',  'Week 9 contribution',  'Imported', '2026-07-24 10:00:00+05:30'),
  ('pay-hamas-10', 'fam-hamas', 1500, 'Not recorded', '2026-07-31', 'Other', 'W10-IMPORT', 'Week 10 contribution', 'Imported', '2026-07-31 10:00:00+05:30');

-- Verification Query to check totals:
-- Expected Output:
-- Nooman: 15,000 | Rikaz: 10,500 | Haneef: 15,000 | Hamas: 15,000 | Total: 55,500
select 
  f.name as family_name,
  count(p.id) as payment_count,
  sum(p.amount) as total_collected
from public.families f
left join public.payments p on p.family_id = f.id
group by f.id, f.name, f.sort_order
order by f.sort_order;
