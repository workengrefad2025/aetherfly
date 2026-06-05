import { Booking } from '../types';

const escapeHtml = (value: unknown) => {
  const text = String(value ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export interface SupportEmailPayload {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  bookingRef?: string;
  timestamp: string;
}

export const buildSupportEmail = (payload: SupportEmailPayload) => ({
  subject: `AetherFly Support Request — ${escapeHtml(payload.subject)}`,
  html: `
    <div style="font-family: system-ui, -apple-system, BlinkMac-SystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px;">
      <div style="max-width: 720px; margin: 0 auto; background: #07122a; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 28px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; color: #020617;">New AetherFly Support Request</h1>
          <p style="margin: 10px 0 0; color: #102a43; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;">Concierge Support Desk</p>
        </div>
        <div style="padding: 28px 32px;">
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">A new support ticket has been submitted. Please review the details below and respond through the concierge inbox.</p>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tbody>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8; width:36%;">Full Name</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(payload.fullName)}</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Email</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(payload.email)}</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Booking Reference</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(payload.bookingRef ?? 'N/A')}</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Category</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(payload.category)}</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Submitted At</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(payload.timestamp)}</td></tr>
            </tbody>
          </table>
          <div style="background: #111b2b; border-radius: 18px; padding: 18px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px; color: #cbd5e1; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase;">Message</p>
            <p style="margin: 0; color: #f8fafc; font-size: 15px; line-height: 1.8; white-space: pre-line;">${escapeHtml(payload.message)}</p>
          </div>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">This message was generated from the AetherFly support form. Please follow up with the customer promptly.</p>
        </div>
      </div>
    </div>`
});

export const buildBookingConfirmationEmail = (booking: Booking) => ({
  subject: `AetherFly booking ${escapeHtml(booking.ref)} has been confirmed`,
  html: `
    <div style="font-family: system-ui, -apple-system, BlinkMac-SystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px;">
      <div style="max-width: 720px; margin: 0 auto; background: #07122a; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: #020617;">Booking Confirmed</h1>
          <p style="margin: 12px 0 0; color: #102a43; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">AetherFly Luxury Travel</p>
        </div>
        <div style="padding: 28px 32px;">
          <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">Dear ${escapeHtml(booking.passengerName)},</p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">Your booking is confirmed. Please keep this email for your travel records.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tbody>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8; width:42%;">Booking Reference</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.ref)}</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Passenger</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.passengerName)}</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Status</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.status)}</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Route</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.flight.fromName)} → ${escapeHtml(booking.flight.toName)}</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Departure Airport</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.flight.fromName)} (${escapeHtml(booking.flight.fromCode)})</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Arrival Airport</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.flight.toName)} (${escapeHtml(booking.flight.toCode)})</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Seat</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.seatCode)}</td></tr>
              <tr><td style="padding: 14px; color:#94a3b8;">Cabin Class</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.cabinClass ?? booking.seatClass)}</td></tr>
              <tr style="background: #0e1830;"><td style="padding: 14px; color:#94a3b8;">Flight</td><td style="padding: 14px; color:#f8fafc;">${escapeHtml(booking.flight.flightNo)}</td></tr>
            </tbody>
          </table>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">If you need any modifications to your itinerary, reply to this message and our concierge team will assist you.</p>
        </div>
      </div>
    </div>`
});

export const buildTicketDeliveryEmail = (booking: Booking, ticketUrl: string) => ({
  subject: `Your AetherFly e-ticket is ready — ${escapeHtml(booking.ref)}`,
  html: `
    <div style="font-family: system-ui, -apple-system, BlinkMac-SystemFont, 'Segoe UI', sans-serif; background: #020617; color: #e2e8f0; padding: 24px;">
      <div style="max-width: 720px; margin: 0 auto; background: #07122a; border: 1px solid #334155; border-radius: 24px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #d4a24c, #f8eab2); padding: 28px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; color: #020617;">Your e-Ticket Is Ready</h1>
          <p style="margin: 8px 0 0; color: #102a43; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em;">AetherFly Boarding Pass</p>
        </div>
        <div style="padding: 28px 32px;">
          <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.75; color: #cbd5e1;">Hello ${escapeHtml(booking.passengerName)},</p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.75; color: #cbd5e1;">Your digital ticket is available now. Click below to view, print, or save your boarding pass.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${escapeHtml(ticketUrl)}" style="display: inline-block; text-decoration: none; background: #d4a24c; color: #020617; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px;">View Your e-Ticket</a>
          </div>
          <div style="background: #0f172a; border: 1px solid #334155; border-radius: 18px; padding: 18px;">
            <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Ticket Reference</p>
            <p style="margin: 0; color: #f8fafc; font-size: 16px;"><strong>${escapeHtml(booking.ref)}</strong></p>
          </div>
          <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">If you need immediate assistance, reply to this message and our concierge desk will support you.</p>
        </div>
      </div>
    </div>`
});
