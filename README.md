# 🌙 Qurban Family Savings Tracker 2026/27

A clean, mobile-friendly web application to manage a 4-family Qurban savings fund for Eid al-Adha 2027 (Sri Lanka). Built with Next.js, Tailwind CSS, Supabase, Vercel, and Notify.lk.

---

## ✨ Features

- **Automated Financial Calculation Engine (`lib/calculations.ts`)**: Single shared function across dashboard, payments, tracker, cards, and SMS.
  - Automatically calculates weeks elapsed from **29 May 2026 (Week 1)**.
  - Calculates expected contribution vs. total paid.
  - Formats balances: *"X weeks ahead"*, *"Up to date ✅"*, or *"Rs. X due · Y weeks behind"*.
- **51-Week Savings Tracker**: Oldest-first waterfall allocation fills each family's weeks with paid, part-paid, not paid, and advance statuses.
- **Role-Based Access Control**:
  - **Main Admin** (Mr. Nooman): Full control (add/edit/delete all payments, settings, family contacts, SMS triggers).
  - **Sub Admin** (Mr. Rikaz): Can add payments; can only edit own payments created on the same day.
  - **Family Accounts** (Mr. Haneef, Mr. Hamas): Transparent, read-only ledger.
- **WhatsApp Shareable Card Generator**: One-click download of branded summary card (PNG) and emoji-formatted message text to paste directly into WhatsApp family groups.
- **Automated Weekly SMS (Notify.lk + Vercel Cron)**:
  - Runs automatically every Thursday at **8:00 PM Sri Lanka Time (14:30 UTC)**.
  - Sends personalized SMS to husband and wife of each family.
  - Built-in deduplication (never sends twice to the same number in the same week).
  - Admin controls for test SMS and on-demand triggers.
- **Dual Mode (Instant Demo + Supabase Live)**:
  - Runs out of the box with seeded W1–W10 data (Rs. 55,500 total).
  - Connects immediately to Supabase when credentials are provided in `.env.local`.

---

## 🚀 Step-by-Step Setup Guide

### 1. Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create a new free project.
2. Open the **SQL Editor** from the left sidebar.
3. Open `supabase/schema.sql` from this repository, copy all the SQL, paste it into the Supabase SQL Editor, and click **Run**.
   - This creates `families`, `settings`, `payments`, `sms_logs`, and `user_profiles` tables with Row Level Security (RLS) policies.
4. Open `supabase/seed.sql`, paste it into the SQL Editor, and click **Run**.
   - This seeds the 4 families, default fund settings, and the exact W1–W10 payments.
5. In the SQL Editor results, verify the totals:
   ```
   Mr. Nooman:  Rs. 15,000 (10 payments)
   Mr. Rikaz:   Rs. 10,500 (W1-W5, W6 part, W7)
   Mr. Haneef:  Rs. 15,000 (W1, W2 part, W3-W10)
   Mr. Hamas:   Rs. 15,000 (10 payments)
   Total:       Rs. 55,500
   ```
6. In Supabase, go to **Project Settings → API** and copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) 
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) 

---

### 2. Notify.lk SMS Gateway Setup (Sri Lanka)

1. Sign up at [notify.lk](https://notify.lk).
2. Go to **Settings** or **API Keys** on your Notify.lk dashboard.
3. Note your:
   - **User ID** (`NOTIFYLK_USER_ID`) 
   - **API Key** (`NOTIFYLK_API_KEY`) 
   - **Sender ID** (`NOTIFYLK_SENDER_ID`) — Use `NotifyDEMO` for initial testing until your custom sender ID is approved.

> *Note: If you run the app without Notify.lk credentials, the app operates in simulation mode, logging SMS messages safely to the delivery log without errors.*

---

### 3. Deploy to Vercel & Vercel Cron

1. Push your repository to GitHub or run `npx vercel` in the terminal.
2. In your Vercel Project Settings under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NOTIFYLK_USER_ID=your_notify_user_id
   NOTIFYLK_API_KEY=your_notify_api_key
   NOTIFYLK_SENDER_ID=NotifyDEMO
   CRON_SECRET=a_random_secret_string
   ```
3. Deploy! Vercel automatically detects `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/weekly-sms",
         "schedule": "30 14 * * 4"
       }
     ]
   }
   ```
   This triggers `/api/cron/weekly-sms` every **Thursday at 14:30 UTC (8:00 PM Sri Lanka Time)**.

---

### 4. Creating Admin & Sub-Admin Accounts

1. In your Supabase Dashboard, go to **Authentication → Users**.
2. Click **Add User → Create User**:
    - Create Main Admin: `hamas@qurban.local` (Mr. Hamas)
    - Create Sub Admin: `nihla@qurban.local` (Nihla - Authorized Data Entry)
    - Create Family Viewers: `nooman@qurban.local`, `rikaz@qurban.local`, `haneef@qurban.local`
3. In the Supabase SQL Editor, link their roles:
    ```sql
    -- Insert or link User Profiles
    insert into public.user_profiles (id, email, full_name, role, family_id)
    values
      ('USER_UUID_FOR_HAMAS', 'hamas@qurban.local', 'Mr. Hamas', 'main_admin', 'fam-hamas'),
      ('USER_UUID_FOR_NIHLA', 'nihla@qurban.local', 'Nihla', 'sub_admin', null),
      ('USER_UUID_FOR_NOOMAN', 'nooman@qurban.local', 'Mr. Nooman', 'family', 'fam-nooman'),
      ('USER_UUID_FOR_RIKAZ', 'rikaz@qurban.local', 'Mr. Rikaz', 'family', 'fam-rikaz'),
      ('USER_UUID_FOR_HANEEF', 'haneef@qurban.local', 'Mr. Haneef', 'family', 'fam-haneef');
    ```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Use the role switcher in the sidebar/menu to test as **Main Admin**, **Sub Admin**, or **Family View**.

---

## 📂 Folder Structure

```
qurban-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/weekly-sms/route.ts   # Vercel cron weekly SMS trigger
│   │   │   └── sms/send/route.ts          # Manual SMS test sender
│   │   ├── family/[id]/page.tsx           # Individual family ledger statement
│   │   ├── payments/
│   │   │   ├── add/page.tsx               # Add payment with live impact preview
│   │   │   └── page.tsx                   # All payments with filters and edit/delete
│   │   ├── settings/page.tsx              # Settings, family contacts, SMS triggers
│   │   ├── tracker/page.tsx               # 51-week Excel-style savings grid
│   │   ├── weekly-card/page.tsx           # Shareable WhatsApp graphic card & text
│   │   ├── globals.css                    # Emerald & gold design system
│   │   ├── layout.tsx                     # Root layout with navigation & footer
│   │   └── page.tsx                       # Dashboard with KPIs, cards, and charts
│   ├── components/
│   │   ├── Charts.tsx                     # SVG weekly collection & method charts
│   │   ├── FamilyCard.tsx                 # Family balance card with color badges
│   │   ├── Navigation.tsx                 # Desktop sidebar & mobile bottom bar
│   │   └── StatCard.tsx                   # Metric KPI card
│   ├── context/
│   │   └── AppContext.tsx                 # Unified state management & demo switcher
│   ├── lib/
│   │   ├── calculations.ts                # Single shared calculation engine
│   │   ├── mock-data.ts                   # W1-W10 seed payments dataset
│   │   ├── notify-lk.ts                   # Notify.lk SMS API client
│   │   └── supabase.ts                    # Supabase client helper
│   └── types/
│       └── index.ts                       # TypeScript interfaces
├── supabase/
│   ├── schema.sql                         # Tables, indexes, and RLS policies
│   └── seed.sql                           # Seed data (55,500 LKR total)
├── vercel.json                            # Weekly Thursday 14:30 UTC cron job
└── README.md
```

---

*Jazakallahu Khairan 🤲 · #QurbanFamily2027*
