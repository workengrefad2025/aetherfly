import { buildBookingConfirmationEmail, buildTicketDeliveryEmail } from '../src/services/emailTemplates';
import { sendEmailWithRetry } from '../src/services/resendService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = req.body ?? {};
  const booking = payload.booking;
  const customerEmail = String(payload.customerEmail ?? '').trim();

  if (!booking || !customerEmail) {
    res.status(400).json({ error: 'Missing booking or customerEmail.' });
    return;
  }

  try {
    const confirmationPayload = buildBookingConfirmationEmail(booking);
    const ticketUrl = `https://aetherfly.com/e-ticket/${encodeURIComponent(String(booking.ref ?? ''))}`;
    const ticketPayload = buildTicketDeliveryEmail(booking, ticketUrl);

    const confirmationResult = await sendEmailWithRetry({
      to: customerEmail,
      subject: confirmationPayload.subject,
      html: confirmationPayload.html
    });

    const ticketResult = await sendEmailWithRetry({
      to: customerEmail,
      subject: ticketPayload.subject,
      html: ticketPayload.html
    });

    res.status(200).json({
      ok: true,
      provider: 'resend',
      confirmation: confirmationResult,
      ticket: ticketResult
    });
  } catch (error) {
    console.error('[bookingEmailHandler] failed to send booking or ticket email:', error);
    res.status(500).json({ error: 'Failed to deliver booking email.', details: error instanceof Error ? error.message : String(error) });
  }
}
