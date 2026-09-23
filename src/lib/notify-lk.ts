interface SendSMSParams {
  to: string;
  message: string;
}

interface SendSMSResult {
  success: boolean;
  status: 'sent' | 'failed' | 'simulated';
  messageId?: string;
  error?: string;
}

/**
 * Normalizes Sri Lanka phone number to 94XXXXXXXXX format without leading '+'
 */
export function normalizeSLPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  } else if (!cleaned.startsWith('94') && cleaned.length === 9) {
    cleaned = '94' + cleaned;
  }
  return cleaned;
}

/**
 * Sends an SMS using Notify.lk API.
 * If credentials are missing or in dev/demo mode, logs and simulates sending.
 */
export async function sendNotifyLKSMS({ to, message }: SendSMSParams): Promise<SendSMSResult> {
  const userId = process.env.NOTIFYLK_USER_ID;
  const apiKey = process.env.NOTIFYLK_API_KEY;
  const senderId = process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO';

  const normalizedTo = normalizeSLPhone(to);

  // If credentials are not set, simulate sending for smooth local testing
  if (!userId || !apiKey) {
    console.info(`[Notify.lk Simulation] SMS to ${normalizedTo}: "${message}"`);
    return {
      success: true,
      status: 'simulated',
      messageId: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  }

  try {
    const payload = new URLSearchParams();
    payload.append('user_id', userId);
    payload.append('api_key', apiKey);
    payload.append('sender_id', senderId);
    payload.append('to', normalizedTo);
    payload.append('message', message);

    const response = await fetch('https://app.notify.lk/api/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && result.status === 'error')) {
      const errMsg = result?.data || result?.message || `HTTP ${response.status}`;
      return {
        success: false,
        status: 'failed',
        error: String(errMsg),
      };
    }

    return {
      success: true,
      status: 'sent',
      messageId: result?.data?.id || `sent-${Date.now()}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      status: 'failed',
      error: errorMsg,
    };
  }
}
