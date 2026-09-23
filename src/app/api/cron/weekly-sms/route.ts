import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { INITIAL_FAMILIES, INITIAL_PAYMENTS, INITIAL_SETTINGS } from '@/lib/mock-data';
import {
  calculateFamilyStatus,
  generateSMSMessage,
  getWeeksDue,
} from '@/lib/calculations';
import { sendNotifyLKSMS } from '@/lib/notify-lk';
import { Family, Payment, AppSettings } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify Vercel Cron Secret if set
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let families: Family[] = INITIAL_FAMILIES;
  let payments: Payment[] = INITIAL_PAYMENTS;
  let settings: AppSettings = INITIAL_SETTINGS;

  const client = supabase;
  if (isSupabaseConfigured && client) {
    try {
      const [fRes, pRes, sRes] = await Promise.all([
        client.from('families').select('*').order('sort_order'),
        client.from('payments').select('*'),
        client.from('settings').select('*').limit(1).maybeSingle(),
      ]);

      if (fRes.data && fRes.data.length > 0) families = fRes.data;
      if (pRes.data && pRes.data.length > 0) payments = pRes.data;
      if (sRes.data) settings = sRes.data;
    } catch (e) {
      console.warn('Cron: error fetching from Supabase, using mock fallback', e);
    }
  }

  if (!settings.sms_enabled) {
    return NextResponse.json({
      message: 'Weekly SMS is disabled in Settings',
      sent: 0,
    });
  }

  const currentWeek = getWeeksDue(settings.start_date, undefined, settings.total_weeks);
  const results: Array<{ family: string; recipient: string; phone: string; status: string }> = [];

  for (const fam of families) {
    const status = calculateFamilyStatus(fam, payments, settings);
    const message = generateSMSMessage(fam, status, settings);

    const recipients = [
      { name: fam.husband_name || fam.name, phone: fam.husband_phone },
      { name: fam.wife_name || `${fam.name} Wife`, phone: fam.wife_phone },
    ];

    for (const rec of recipients) {
      if (!rec.phone || rec.phone.trim() === '') continue;

      // Deduplication check
      let alreadySent = false;
      if (isSupabaseConfigured && client) {
        const { data: existing } = await client
          .from('sms_logs')
          .select('id')
          .eq('phone_number', rec.phone)
          .eq('week_number', currentWeek)
          .eq('status', 'sent')
          .limit(1);

        if (existing && existing.length > 0) {
          alreadySent = true;
        }
      }

      if (alreadySent) {
        results.push({
          family: fam.name,
          recipient: rec.name,
          phone: rec.phone,
          status: 'skipped (already sent this week)',
        });
        continue;
      }

      // Send SMS
      const smsResult = await sendNotifyLKSMS({
        to: rec.phone,
        message,
      });

      // Log in DB if supabase configured
      if (isSupabaseConfigured && client) {
        await client.from('sms_logs').insert([
          {
            family_id: fam.id,
            family_name: fam.name,
            recipient_name: rec.name,
            phone_number: rec.phone,
            message,
            status: smsResult.status,
            week_number: currentWeek,
            error_message: smsResult.error || null,
            sent_at: new Date().toISOString(),
          },
        ]);
      }

      results.push({
        family: fam.name,
        recipient: rec.name,
        phone: rec.phone,
        status: smsResult.status,
      });
    }
  }

  return NextResponse.json({
    success: true,
    week_number: currentWeek,
    total_processed: results.length,
    results,
  });
}
