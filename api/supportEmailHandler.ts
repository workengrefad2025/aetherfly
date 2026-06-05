import { buildSupportEmail } from '../src/services/emailTemplates';
import { sendEmailWithRetry } from '../src/services/resendService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = req.body ?? {};
  const fullName = String(payload.fullName ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const subject = String(payload.subject ?? '').trim();
  const category = String(payload.category ?? '').trim();
  const message = String(payload.message ?? '').trim();
  const bookingRef = payload.bookingRef ? String(payload.bookingRef).trim() : undefined;
  const timestamp = String(payload.timestamp ?? new Date().toISOString()).trim();

  if (!fullName || !email || !subject || !category || !message) {
    res.status(400).json({ error: 'Missing required support fields.' });
    return;
  }

  try {
    const emailPayload = buildSupportEmail({
      fullName,
      email,
      subject,
      category,
      message,
      bookingRef,
      timestamp
    });

    const result = await sendEmailWithRetry({
      to: 'refadsaeed2025@gmail.com',
      subject: emailPayload.subject,
      html: emailPayload.html
    });

    res.status(200).json({ ok: true, provider: 'resend', result });
  } catch (error) {
    console.error('[supportEmailHandler] failed to send support email:', error);
    res.status(500).json({ error: 'Failed to deliver support email.', details: error instanceof Error ? error.message : String(error) });
  }
}
