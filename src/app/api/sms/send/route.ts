import { NextRequest, NextResponse } from 'next/server';
import { sendNotifyLKSMS } from '@/lib/notify-lk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Recipient phone number and message are required' },
        { status: 400 }
      );
    }

    const result = await sendNotifyLKSMS({ to, message });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
