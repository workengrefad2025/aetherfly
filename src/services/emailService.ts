import { Booking } from '../types';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  meta?: Record<string, any>;
}

export const EmailTemplates = {
  bookingConfirmation: (booking: Booking) => ({
    subject: `AetherFly booking ${booking.ref} has been confirmed`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px;">
        <div style="max-width: 720px; margin: 0 auto; background: #0b1220; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #020617;">Booking Confirmed</h1>
            <p style="margin: 12px 0 0; color: #102a43; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">AetherFly Elevated Travel</p>
          </div>
          <div style="padding: 28px 32px;">
            <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">Dear ${booking.passengerName},</p>
            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">Your reservation has been secured. Below is the summary of your luxury journey.</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>
                <tr style="background: #111b2b;"><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Booking Reference</td><td style="padding: 14px; font-size: 13px; color: #fff;">${booking.ref}</td></tr>
                <tr><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Passenger</td><td style="padding: 14px; font-size: 13px; color: #fff;">${booking.passengerName}</td></tr>
                <tr style="background: #111b2b;"><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Route</td><td style="padding: 14px; font-size: 13px; color: #fff;">${booking.flight.fromName} → ${booking.flight.toName}</td></tr>
                <tr><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Flight</td><td style="padding: 14px; font-size: 13px; color: #fff;">${booking.flight.flightNo}</td></tr>
                <tr style="background: #111b2b;"><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Seat Class</td><td style="padding: 14px; font-size: 13px; color: #fff;">${booking.seatClass}</td></tr>
                <tr><td style="padding: 14px; font-size: 13px; color: #94a3b8;">Total Paid</td><td style="padding: 14px; font-size: 13px; color: #fff;">$${booking.price.toFixed(2)} USD</td></tr>
              </tbody>
            </table>
            <div style="padding: 22px; background: #111b2b; border-radius: 18px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 8px; font-size: 16px; color: #f8fafc;">Next Step</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #cbd5e1;">Your e-ticket is being prepared and will arrive in a separate delivery within moments. Please keep this message for your travel records and contact concierge support if you require changes.</p>
            </div>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">Thank you for choosing AetherFly. We look forward to escorting you on an unforgettable journey.</p>
          </div>
        </div>
      </div>`
  }),

  paymentSuccess: (bookingRef: string, amount: number, currency: string) => ({
    subject: `Payment received for ${bookingRef}`,
    html: `<p>We received a payment of ${currency} ${amount.toFixed(2)} for booking <strong>${bookingRef}</strong>.</p>`
  }),

  itinerary: (booking: Booking) => ({
    subject: `Your itinerary — ${booking.ref}`,
    html: `<h3>Itinerary for ${booking.passengerName}</h3><p>Flight: ${booking.flight.flightNo} — ${booking.flight.fromName} to ${booking.flight.toName}</p>`
  }),

  ticketDelivery: (booking: Booking, ticketUrl: string) => ({
    subject: `Your AetherFly e-ticket is ready — ${booking.ref}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #e2e8f0; padding: 24px;">
        <div style="max-width: 720px; margin: 0 auto; background: #07122a; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 28px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #020617;">e-Ticket Delivered</h1>
            <p style="margin: 8px 0 0; color: #102a43; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em;">Ready for boarding and premium travel checks</p>
          </div>
          <div style="padding: 28px 32px;">
            <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.75; color: #cbd5e1;">Hello ${booking.passengerName},</p>
            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.75; color: #cbd5e1;">Your digital ticket is available now. Use the button below to view, print, or save your personalized boarding pass.</p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${ticketUrl}" style="display: inline-block; text-decoration: none; background: #d4a24c; color: #020617; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px;">View Your e-Ticket</a>
            </div>
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 18px; padding: 18px;">
              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Ticket Reference</p>
              <p style="margin: 0; color: #f8fafc; font-size: 16px;"><strong>${booking.ref}</strong></p>
            </div>
            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">If you need any immediate adjustments, our concierge desk is available 24/7 by replying to this message.</p>
          </div>
        </div>
      </div>`
  }),

  supportNotification: (payload: {
    fullName: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    bookingRef?: string;
    submittedAt: string;
  }) => ({
    subject: `AetherFly Support Request — ${payload.subject}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px;">
        <div style="max-width: 720px; margin: 0 auto; background: #07122a; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 28px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #020617;">New Concierge Ticket Received</h1>
            <p style="margin: 10px 0 0; color: #102a43; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;">AetherFly Support Desk</p>
          </div>
          <div style="padding: 28px 32px;">
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">A new support ticket has arrived from a premium traveller. Please review the details below and respond through the concierge console.</p>
            <table style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tbody>
                <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8; width:35%;">Name</td><td style="padding: 14px; color:#f8fafc;">${payload.fullName}</td></tr>
                <tr><td style="padding: 14px; color:#94a3b8;">Email</td><td style="padding: 14px; color:#f8fafc;">${payload.email}</td></tr>
                <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Category</td><td style="padding: 14px; color:#f8fafc;">${payload.category}</td></tr>
                <tr><td style="padding: 14px; color:#94a3b8;">Booking Ref</td><td style="padding: 14px; color:#f8fafc;">${payload.bookingRef ?? 'N/A'}</td></tr>
                <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Submitted</td><td style="padding: 14px; color:#f8fafc;">${new Date(payload.submittedAt).toLocaleString()}</td></tr>
              </tbody>
            </table>
            <div style="background: #111b2b; border-radius: 18px; padding: 18px;">
              <p style="margin: 0 0 10px; color: #cbd5e1; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase;">Message</p>
              <p style="margin: 0; color: #f8fafc; font-size: 15px; line-height: 1.8; white-space: pre-line;">${payload.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          </div>
        </div>
      </div>`
  })
};

export const EmailService = {
  async prepareAndQueueEmail(payload: EmailPayload) {
    const envelope = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.html,
      meta: payload.meta,
      sentAt: new Date().toISOString()
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const history = window.localStorage.getItem('aetherfly_sent_emails');
        const sentEmails = history ? JSON.parse(history) : [];
        sentEmails.unshift(envelope);
        window.localStorage.setItem('aetherfly_sent_emails', JSON.stringify(sentEmails.slice(0, 50)));
      }
    } catch (error) {
      console.warn('[EmailService] failed to persist queued email:', error);
    }

    console.log('[EmailService] queueing email to', payload.to, payload.subject);
    return { ok: true, queuedAt: envelope.sentAt };
  }
};

export default EmailService;
